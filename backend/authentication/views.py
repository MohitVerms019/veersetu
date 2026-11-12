"""
VEER SETU 🇮🇳 - Secure Authentication Views
Hardened against Brute Force, Session Hijacking, and Credential Stuffing
"""

import time
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.utils import timezone

from .models import User, Role, AccountSecurity, SessionDevice, PasswordResetToken
from .security_service import SecurityService
from .decorators import rate_limited


@require_http_methods(["GET", "POST"])
@rate_limited(max_requests=10, window_seconds=60)
def register_view(request):
    """
    Handles user onboarding with strong password complexity enforcement.
    """
    if request.method == "POST":
        full_name = request.POST.get("full_name", "").strip()
        email = request.POST.get("email", "").strip().lower()
        phone = request.POST.get("phone", "").strip()
        role = request.POST.get("category", Role.SERVING_PERSONNEL)
        password = request.POST.get("password", "")
        confirm_password = request.POST.get("confirm_password", "")

        # Defensive validation
        if not full_name or not email or not phone or not password:
            messages.error(request, "All required fields must be supplied.")
            return render(request, "register.html")

        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return render(request, "register.html")

        try:
            SecurityService.validate_password_complexity(password)
        except Exception as e:
            messages.error(request, str(e.message if hasattr(e, 'message') else e))
            return render(request, "register.html")

        # Sanitize role: users cannot self-assign Administrator!
        if role not in (Role.SERVING_PERSONNEL, Role.RETIRED_PERSONNEL, Role.FAMILY_MEMBER):
            role = Role.SERVING_PERSONNEL

        if User.objects.filter(email=email).exists():
            messages.error(request, "An account with this email address already exists.")
            return render(request, "register.html")

        # Create user with Argon2id / bcrypt hashed password
        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            phone=phone,
            role=role
        )

        SecurityService.log_event(
            event_type="USER_REGISTERED",
            actor_email=user.email,
            actor_role=user.role,
            ip_address=SecurityService.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details=f"New profile created under category: {user.get_role_display()}."
        )

        messages.success(request, "Account created successfully. Please login to enter the portal.")
        return redirect('login')

    return render(request, "register.html")


@require_http_methods(["GET", "POST"])
@rate_limited(max_requests=5, window_seconds=60)
def login_view(request):
    """
    Secure login with brute-force protection and automatic lockout.
    """
    if request.method == "POST":
        username_or_email = request.POST.get("username", "").strip().lower()
        password = request.POST.get("password", "")
        ip_addr = SecurityService.get_client_ip(request)

        # Lookup user by email or by Army service number in military profile
        user = User.objects.filter(email=username_or_email).first()
        if not user:
            # Check military profile for army service number
            from .models import MilitaryProfile
            prof = MilitaryProfile.objects.filter(army_service_number__iexact=username_or_email).first()
            if prof:
                user = prof.user

        if user:
            sec_profile = getattr(user, 'security_profile', None)
            if not sec_profile:
                sec_profile = AccountSecurity.objects.create(user=user)

            # 1. Check Account Lockout
            if sec_profile.is_locked():
                remaining_mins = int((sec_profile.locked_until - timezone.now()).total_seconds() / 60)
                SecurityService.log_event(
                    event_type="LOCKED_ACCOUNT_LOGIN_ATTEMPT",
                    actor_email=user.email,
                    actor_role=user.role,
                    ip_address=ip_addr,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details=f"Attempted login on locked account. Lockout remaining: {remaining_mins} minutes."
                )
                messages.error(
                    request,
                    f"Account locked due to repeated failed login attempts. Please retry in {remaining_mins + 1} minutes."
                )
                return render(request, "login.html")

        # 2. Authenticate
        auth_user = authenticate(request, username=user.email if user else username_or_email, password=password)

        if auth_user is not None and auth_user.is_active:
            sec_profile = auth_user.security_profile
            sec_profile.reset_failed_attempts(current_ip=ip_addr)

            # 3. Check Multi-Factor Authentication
            if sec_profile.is_mfa_enabled or auth_user.is_admin:
                request.session['mfa_pending_user_id'] = auth_user.id
                return redirect('mfa_challenge')

            # 4. Establish Session
            login(request, auth_user)
            request.session['last_activity'] = time.time()

            # Track device session
            SessionDevice.objects.create(
                user=auth_user,
                session_key=request.session.session_key,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:255],
                ip_address=ip_addr
            )

            SecurityService.log_event(
                event_type="LOGIN_SUCCESS",
                actor_email=auth_user.email,
                actor_role=auth_user.role,
                ip_address=ip_addr,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details="Successful authentication into Veer Setu."
            )

            if auth_user.is_admin:
                return redirect('admin_dashboard')
            return redirect('index')

        else:
            # Failed authentication
            if user:
                sec_profile = user.security_profile
                sec_profile.record_failed_attempt(max_allowed=5, lockout_minutes=30)
                attempts_left = max(0, 5 - sec_profile.failed_login_attempts)

                SecurityService.log_event(
                    event_type="LOGIN_FAILED_CREDENTIALS",
                    actor_email=user.email,
                    actor_role=user.role,
                    ip_address=ip_addr,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details=f"Invalid password. Failed attempts: {sec_profile.failed_login_attempts}/5."
                )

                if sec_profile.is_locked():
                    messages.error(request, "Account locked! Too many failed attempts. Try again in 30 minutes.")
                else:
                    messages.error(request, f"Invalid credentials. You have {attempts_left} attempts remaining.")
            else:
                SecurityService.log_event(
                    event_type="LOGIN_FAILED_UNKNOWN_USER",
                    actor_email=username_or_email,
                    actor_role="GUEST",
                    ip_address=ip_addr,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details="Attempted login with non-existent user identifier."
                )
                messages.error(request, "Invalid username or password.")

            return render(request, "login.html")

    return render(request, "login.html")


@require_http_methods(["GET", "POST"])
def logout_view(request):
    """
    Terminates current session and purges tracking record.
    """
    if request.user.is_authenticated:
        ip_addr = SecurityService.get_client_ip(request)
        SecurityService.log_event(
            event_type="USER_LOGOUT",
            actor_email=request.user.email,
            actor_role=request.user.role,
            ip_address=ip_addr,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details="User ended session voluntarily."
        )
        # Mark session inactive
        SessionDevice.objects.filter(session_key=request.session.session_key).update(is_active=False)

    logout(request)
    messages.info(request, "You have been securely signed out.")
    return redirect('login')


@require_http_methods(["POST"])
def logout_all_devices_view(request):
    """
    Terminates all active sessions across all devices for the authenticated user.
    """
    if not request.user.is_authenticated:
        return redirect('login')

    SecurityService.terminate_all_sessions(request.user)
    logout(request)
    messages.success(request, "Successfully logged out from all devices.")
    return redirect('login')


@require_http_methods(["POST"])
@rate_limited(max_requests=3, window_seconds=120)
def password_reset_request_view(request):
    """
    Generates a cryptographically random, time-limited password reset token.
    Only stores the SHA-256 hash in database.
    """
    email = request.POST.get("email", "").strip().lower()
    user = User.objects.filter(email=email).first()

    if user:
        raw_token = PasswordResetToken.generate_token(user, validity_minutes=15)
        # In production: email raw_token link to user.email
        SecurityService.log_event(
            event_type="PASSWORD_RESET_REQUESTED",
            actor_email=user.email,
            actor_role=user.role,
            ip_address=SecurityService.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details="Password reset token issued (validity 15 mins)."
        )

    # Always return success message to prevent user enumeration attacks
    messages.info(request, "If an account exists for this email, password reset instructions have been dispatched.")
    return redirect('login')

