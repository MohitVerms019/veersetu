"""
VEER SETU 🇮🇳 - Role-Based Access Control (RBAC) & Security Decorators
Strict separation of privilege preventing horizontal and vertical privilege escalation.
"""

import time
from functools import wraps
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.contrib import messages
from .models import Role
from .security_service import SecurityService

# In-memory sliding window cache for rate limiting
_RATE_LIMIT_CACHE = {}


def role_required(*allowed_roles):
    """
    Enforces strict Role-Based Access Control (RBAC).
    Normal users cannot access admin dashboards; non-serving cannot access serving-only benefits.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                messages.warning(request, "Please log in to access this defense service.")
                return redirect('login')

            if request.user.role in allowed_roles or request.user.is_superuser:
                return view_func(request, *args, **kwargs)

            # Security Violation: Log unauthorized attempt
            ip_addr = SecurityService.get_client_ip(request)
            SecurityService.log_event(
                event_type="UNAUTHORIZED_ROLE_ACCESS_DENIED",
                actor_email=request.user.email,
                actor_role=request.user.role,
                ip_address=ip_addr,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details=f"Attempted access to view: {view_func.__name__} requiring roles: {[r for r in allowed_roles]}"
            )

            messages.error(request, "Access Denied: You do not have the required defense credentials for this section.")
            raise PermissionDenied("Insufficient defense privilege level.")

        return _wrapped_view
    return decorator


def verified_military_required(view_func):
    """
    Restricts sensitive financial disbursements & card allocations to
    personnel whose uploaded proof documents have been APPROVED by admin.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')

        if request.user.is_verified_military or request.user.is_admin:
            return view_func(request, *args, **kwargs)

        messages.info(request, "This welfare facility requires an Approved Veer Setu Military Verification Pass.")
        return redirect('verification_portal')

    return _wrapped_view


def admin_mfa_required(view_func):
    """
    Requires administrators to confirm a Multi-Factor Authentication token
    within the last 10 minutes prior to executing high-privilege operations.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_admin:
            raise PermissionDenied("Administrator credentials mandatory.")

        confirmed_at = request.session.get('admin_mfa_confirmed_at', 0)
        # Re-authenticate if MFA confirmation is older than 10 minutes (600s)
        if time.time() - confirmed_at > 600:
            request.session['pre_mfa_redirect'] = request.path
            return redirect('admin_mfa_challenge')

        return view_func(request, *args, **kwargs)

    return _wrapped_view


def rate_limited(max_requests=5, window_seconds=60):
    """
    Sliding window rate-limiter to defeat automated brute-force and credential stuffing.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            ip_addr = SecurityService.get_client_ip(request)
            now = time.time()

            # Clean expired timestamps
            timestamps = _RATE_LIMIT_CACHE.get(ip_addr, [])
            valid_timestamps = [t for t in timestamps if now - t < window_seconds]

            if len(valid_timestamps) >= max_requests:
                SecurityService.log_event(
                    event_type="RATE_LIMIT_EXCEEDED",
                    actor_email=request.user.email if request.user.is_authenticated else 'ANONYMOUS',
                    actor_role='GUEST',
                    ip_address=ip_addr,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details=f"IP {ip_addr} exceeded {max_requests} requests per {window_seconds}s on {view_func.__name__}."
                )
                messages.error(request, "Too many attempts from your network. Please wait a moment before trying again.")
                raise PermissionDenied("Rate limit threshold exceeded. Request throttled.")

            valid_timestamps.append(now)
            _RATE_LIMIT_CACHE[ip_addr] = valid_timestamps

            return view_func(request, *args, **kwargs)

        return _wrapped_view
    return decorator

