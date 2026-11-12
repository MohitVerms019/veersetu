"""
VEER SETU 🇮🇳 - Authentication & Security Models
Role-Based Access Control (RBAC), Session Tracking, MFA & Security Audit Logs
"""

import hashlib
import secrets
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.core.exceptions import ValidationError


class Role(models.TextChoices):
    SERVING_PERSONNEL = 'SERVING', 'Serving Army Personnel'
    RETIRED_PERSONNEL = 'RETIRED', 'Retired Army Personnel (Veteran / ESM)'
    FAMILY_MEMBER = 'FAMILY', 'Army Family Member'
    ADMINISTRATOR = 'ADMIN', 'Welfare Administrator'


class CustomUserManager(BaseUserManager):
    """Secure user manager that enforces email normalization and validation."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is mandatory for defense authentication.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)  # Triggers Argon2id / bcrypt hashing
        else:
            raise ValueError('A strong password is required.')
        user.save(using=self._db)
        
        # Initialize Security Profile
        AccountSecurity.objects.create(user=user)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Role.ADMINISTRATOR)

        if extra_fields.get('role') != Role.ADMINISTRATOR:
            raise ValueError('Superuser must have ADMINISTRATOR role.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with strict Role-Based Access Control."""
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15, unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SERVING_PERSONNEL,
        db_index=True
    )
    is_verified_military = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'phone']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email', 'role']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == Role.ADMINISTRATOR or self.is_superuser


class MilitaryProfile(models.Model):
    """Detailed defense credentials separated from core authentication table."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='military_profile')
    army_service_number = models.CharField(max_length=30, unique=True, db_index=True)
    rank = models.CharField(max_length=60)
    regiment_corps = models.CharField(max_length=100)
    ppo_number = models.CharField(max_length=60, blank=True, null=True)
    echs_card_number = models.CharField(max_length=60, blank=True, null=True)
    enrolment_date = models.DateField(blank=True, null=True)
    retirement_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.rank} {self.army_service_number} - {self.regiment_corps}"


class AccountSecurity(models.Model):
    """Protects against brute-force attacks, handles MFA and account lockouts."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='security_profile')
    failed_login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)
    mfa_secret = models.CharField(max_length=64, blank=True, null=True)
    is_mfa_enabled = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    password_changed_at = models.DateTimeField(default=timezone.now)

    def is_locked(self):
        """Returns True if the account is currently undergoing lockout duration."""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    def record_failed_attempt(self, max_allowed=5, lockout_minutes=30):
        """Increments failed attempts; automatically locks account if threshold exceeded."""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= max_allowed:
            self.locked_until = timezone.now() + timedelta(minutes=lockout_minutes)
        self.save()

    def reset_failed_attempts(self, current_ip=None):
        """Resets counter upon successful authentication."""
        self.failed_login_attempts = 0
        self.locked_until = None
        if current_ip:
            self.last_login_ip = current_ip
        self.save()


class SessionDevice(models.Model):
    """Tracks active user sessions to enable remote session termination & audit."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='active_sessions')
    session_key = models.CharField(max_length=40, unique=True, db_index=True)
    user_agent = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_active_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.email} - {self.ip_address} ({self.created_at})"


class PasswordResetToken(models.Model):
    """
    Time-limited cryptographically secure password reset token.
    Only the SHA-256 hash of the token is stored in the database.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    @classmethod
    def generate_token(cls, user, validity_minutes=15):
        raw_token = secrets.token_urlsafe(32)
        hashed_token = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=validity_minutes)
        
        cls.objects.create(
            user=user,
            token_hash=hashed_token,
            expires_at=expires_at
        )
        return raw_token  # Returned once to send via secure notification

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at


class SecurityAuditLog(models.Model):
    """
    Tamper-resistant audit log table.
    CRITICAL: Never stores passwords, tokens, or raw identity documents.
    """
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    event_type = models.CharField(max_length=60, db_index=True)
    actor_email = models.CharField(max_length=150)
    actor_role = models.CharField(max_length=30)
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=255)
    details = models.TextField()

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp', 'event_type']),
        ]

    def __str__(self):
        return f"[{self.timestamp}] {self.event_type} by {self.actor_email}"

