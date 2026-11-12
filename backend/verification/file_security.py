"""
VEER SETU 🇮🇳 - File Security & Magic-Byte Validator
Defeats Unrestricted File Uploads, Polyglots, and Path Traversal Attacks (OWASP A04/A08).
"""

import os
import uuid
import hashlib
from pathlib import Path
from django.core.exceptions import ValidationError
from django.conf import settings

# Signature Magic Bytes Mapping
MAGIC_SIGNATURES = {
    'application/pdf': b'%PDF',
    'image/jpeg': b'\xFF\xD8\xFF',
    'image/png': b'\x89PNG\r\n\x1a\n'
}

EXTENSION_TO_MIME = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
}


class DocumentSecurityValidator:
    @staticmethod
    def validate_and_quarantine(uploaded_file):
        """
        Comprehensive security verification:
        1. File size check (5MB max)
        2. Extension whitelist verification
        3. Binary magic-byte signature inspection
        4. SHA-256 calculation
        5. Storage under sanitized UUID in private enclave
        """
        # 1. Size constraint
        max_size = getattr(settings, 'MAX_DOCUMENT_UPLOAD_SIZE', 5 * 1024 * 1024)
        if uploaded_file.size > max_size:
            raise ValidationError(f"File exceeds maximum allowable limit of {max_size / (1024 * 1024):.1f} MB.")

        # 2. Extension validation
        original_name = uploaded_file.name
        ext = os.path.splitext(original_name)[1].lower()
        if ext not in EXTENSION_TO_MIME:
            raise ValidationError("Unsupported file format. Only PDF, JPEG, and PNG are sanctioned.")

        expected_mime = EXTENSION_TO_MIME[ext]

        # 3. Read leading bytes for magic signature validation
        header = uploaded_file.read(16)
        uploaded_file.seek(0)  # Rewind pointer

        magic_byte = MAGIC_SIGNATURES[expected_mime]
        if not header.startswith(magic_byte):
            raise ValidationError(
                f"Malicious file anomaly detected: Header bytes do not match declared extension {ext}."
            )

        # 4. Compute SHA-256 Hash of content
        sha256_hasher = hashlib.sha256()
        for chunk in uploaded_file.chunks():
            sha256_hasher.update(chunk)
        file_hash = sha256_hasher.hexdigest()
        uploaded_file.seek(0)

        # 5. Safe UUID Storage in Private Enclave
        storage_dir = Path(settings.PRIVATE_DOCUMENT_STORAGE_DIR)
        storage_dir.mkdir(parents=True, exist_ok=True)

        safe_filename = f"{uuid.uuid4().hex}{ext}"
        destination_path = storage_dir / safe_filename

        # Defensive Path Traversal check: ensure path stays within storage_dir
        if not str(destination_path.resolve()).startswith(str(storage_dir.resolve())):
            raise ValidationError("Security Error: Path traversal attempt blocked.")

        with open(destination_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        return {
            'safe_filename': safe_filename,
            'original_filename': os.path.basename(original_name),
            'file_size': uploaded_file.size,
            'mime_type': expected_mime,
            'file_hash': file_hash,
            'absolute_path': str(destination_path)
        }

