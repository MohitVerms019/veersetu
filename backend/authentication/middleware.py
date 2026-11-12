"""
VEER SETU 🇮🇳 - Security Middleware Suite
Enforces Content Security Policy, Idle Session Timeouts & Behavioral Threat Auditing
"""

import time
from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import redirect
from django.contrib.auth import logout
from django.contrib import messages
from django.conf import settings
from .security_service import SecurityService


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Injects military-grade HTTP security headers to defeat XSS, Clickjacking,
    MIME-sniffing and cross-origin leakage.
    """
    def process_response(self, request, response):
        # 1. Content Security Policy (CSP)
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        response['Content-Security-Policy'] = csp_policy

        # 2. Anti-MIME Sniffing
        response['X-Content-Type-Options'] = 'nosniff'

        # 3. Anti-Clickjacking (Disallow embedding in iframes)
        response['X-Frame-Options'] = 'DENY'

        # 4. Referrer Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # 5. Restrict Device Hardware APIs
        response['Permissions-Policy'] = 'geolocation=(), camera=(), microphone=(), payment=()'

        # 6. Strict Transport Security (HSTS)
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'

        return response


class SessionTimeoutMiddleware(MiddlewareMixin):
    """
    Terminates inactive sessions after 15 minutes of user inactivity.
    Complies with defense security directives for unattended terminals.
    """
    def process_request(self, request):
        if not request.user.is_authenticated:
            return None

        current_time = time.time()
        last_activity = request.session.get('last_activity')

        # 15 minutes = 900 seconds
        timeout_seconds = getattr(settings, 'SESSION_COOKIE_AGE', 900)

        if last_activity and (current_time - last_activity > timeout_seconds):
            # Session expired
            user_email = request.user.email
            ip_addr = SecurityService.get_client_ip(request)
            
            SecurityService.log_event(
                event_type="SESSION_IDLE_EXPIRED",
                actor_email=user_email,
                actor_role=request.user.role,
                ip_address=ip_addr,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details="User session invalidated due to 15-minute inactivity timeout."
            )
            
            logout(request)
            messages.warning(request, "Your session has expired due to inactivity. Please re-authenticate.")
            return redirect('login')

        request.session['last_activity'] = current_time
        return None


class AccountLockoutMiddleware(MiddlewareMixin):
    """
    Blocks requests from users or sessions that have been flagged as locked out.
    """
    def process_request(self, request):
        if request.user.is_authenticated:
            security_profile = getattr(request.user, 'security_profile', None)
            if security_profile and security_profile.is_locked():
                logout(request)
                messages.error(request, "Your account has been temporarily locked due to security anomalies. Contact defense administrator.")
                return redirect('login')
        return None


class AuditLogMiddleware(MiddlewareMixin):
    """
    Monitors security-relevant state changes (POST, PUT, DELETE) and records telemetry.
    """
    def process_response(self, request, response):
        if request.method in ('POST', 'PUT', 'DELETE') and not request.path.startswith('/static/'):
            actor_email = request.user.email if request.user.is_authenticated else 'ANONYMOUS'
            actor_role = request.user.role if request.user.is_authenticated else 'GUEST'
            ip_addr = SecurityService.get_client_ip(request)

            # Log without collecting passwords or raw request body
            SecurityService.log_event(
                event_type=f"HTTP_{request.method}",
                actor_email=actor_email,
                actor_role=actor_role,
                ip_address=ip_addr,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details=f"Path: {request.path} | HTTP Status: {response.status_code}"
            )
        return response

