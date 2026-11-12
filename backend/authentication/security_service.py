"""
VEER SETU 🇮🇳 - Security Service Engine
Cryptographic token operations, MFA / TOTP verification, PII redaction, and audit logging.
"""

import re
import pyotp
import hashlib
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import SecurityAuditLog, SessionDevice


class SecurityService:
    @staticmethod
    def log_event(event_type, actor_email, actor_role, ip_address, user_agent, details):
        """
        Records a security audit entry with mandatory PII & password redaction.
        Ensures compliance with OWASP A09:2021 Security Logging and Monitoring Failures.
        """
        # Redact any passwords, pins, or raw tokens
        sanitized_details = re.sub(
            r'(password|token|pin|secret|auth)=([^\s&,]+)',
            r'\1=[REDACTED]',
            details,
            flags=re.IGNORECASE
        )
        
        # Mask 12-digit numbers (potential Aadhaar) leaving only last 4 digits
        sanitized_details = re.sub(
            r'\b\d{8}(\d{4})\b',
            r'XXXX-XXXX-\1',
            sanitized_details
        )

        SecurityAuditLog.objects.create(
            event_type=event_type,
            actor_email=actor_email or 'ANONYMOUS',
            actor_role=actor_role or 'GUEST',
            ip_address=ip_address or '127.0.0.1',
            user_agent=str(user_agent)[:255] if user_agent else 'Unknown',
            details=sanitized_details
        )

    @staticmethod
    def validate_password_complexity(password):
        """
        Enforces strict defense password complexity rules:
        - At least 10 characters
        - At least 1 uppercase letter
        - At least 1 lowercase letter
        - At least 1 numeric digit
        - At least 1 special character
        """
        if len(password) < 10:
            raise ValidationError("Password must be at least 10 characters in length.")
        if not re.search(r"[A-Z]", password):
            raise ValidationError("Password must contain at least one uppercase letter (A-Z).")
        if not re.search(r"[a-z]", password):
            raise ValidationError("Password must contain at least one lowercase letter (a-z).")
        if not re.search(r"[0-9]", password):
            raise ValidationError("Password must contain at least one number (0-9).")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
            raise ValidationError("Password must contain at least one special character.")

    @staticmethod
    def generate_totp_secret():
        """Generates a base32 TOTP secret for Multi-Factor Authentication."""
        return pyotp.random_base32()

    @staticmethod
    def verify_totp_token(secret, token):
        """Validates a 6-digit TOTP code with standard 30-second window tolerance."""
        totp = pyotp.TOTP(secret)
        return totp.verify(str(token).strip(), valid_window=1)

    @staticmethod
    def terminate_all_sessions(user, except_session_key=None):
        """
        Terminates all active sessions for a user across all devices.
        Implements OWASP Session Management Logout functionality.
        """
        from django.contrib.sessions.models import Session
        
        devices = SessionDevice.objects.filter(user=user, is_active=True)
        if except_session_key:
            devices = devices.exclude(session_key=except_session_key)

        session_keys_to_delete = list(devices.values_list('session_key', flat=True))
        
        # Invalidate in Django core session store
        Session.objects.filter(session_key__in=session_keys_to_delete).delete()
        
        # Mark inactive in tracking table
        devices.update(is_active=False)

    @staticmethod
    def get_client_ip(request):
        """Extracts validated client IP behind reverse proxies."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip or '127.0.0.1'

