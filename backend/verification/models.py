"""
VEER SETU 🇮🇳 - Military Verification & Document Storage Models
Private Enclave Tracking, Cryptographic Hashes & Admin Adjudication
"""

from django.db import models
from django.conf import settings
from authentication.models import User, Role


class VerificationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Admin Review'
    APPROVED = 'APPROVED', 'Verified & Approved'
    REJECTED = 'REJECTED', 'Rejected / Re-upload Required'


class VerificationRequest(models.Model):
    """
    Tracks military service document submissions.
    Uploaded documents are stored in an encrypted/isolated private enclave.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_requests')
    category = models.CharField(max_length=20, choices=Role.choices)
    army_service_number = models.CharField(max_length=30, db_index=True)
    rank = models.CharField(max_length=60)
    regiment = models.CharField(max_length=100)
    ppo_number = models.CharField(max_length=60, blank=True, null=True)

    # Safe Server-Side Storage Metadata
    stored_filename = models.CharField(max_length=255, unique=True)
    original_filename = models.CharField(max_length=255)
    file_size_bytes = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=50)
    file_sha256 = models.CharField(max_length=64)  # File integrity checksum

    # Adjudication Status
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
        db_index=True
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='adjudicated_verifications'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['status', 'submitted_at']),
        ]

    def __str__(self):
        return f"[{self.status}] {self.army_service_number} - {self.user.full_name}"

