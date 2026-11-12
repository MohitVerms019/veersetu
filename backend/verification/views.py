"""
VEER SETU 🇮🇳 - Protected Document Verification & Streaming Views
Guards against Insecure Direct Object References (IDOR / Broken Access Control)
"""

import os
from pathlib import Path
from django.shortcuts import get_object_or_404, redirect
from django.http import FileResponse, Http404, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import PermissionDenied, ValidationError

from authentication.models import Role, User
from authentication.decorators import role_required, admin_mfa_required
from authentication.security_service import SecurityService
from .models import VerificationRequest, VerificationStatus
from .file_security import DocumentSecurityValidator


@login_required
@require_http_methods(["POST"])
def upload_verification_document(request):
    """
    Handles user submission of Army service documents.
    Enforces magic byte verification and stores file in private enclave.
    """
    if 'document_file' not in request.FILES:
        messages.error(request, "No proof document was attached.")
        return redirect('verification_portal')

    uploaded_file = request.FILES['document_file']
    army_no = request.POST.get('army_service_number', '').strip().upper()
    category = request.POST.get('category', request.user.role)
    rank = request.POST.get('rank', 'Not Specified')
    regiment = request.POST.get('regiment', 'Not Specified')
    ppo_no = request.POST.get('ppo_number', '').strip()

    if not army_no:
        messages.error(request, "Official Army / Service Number is mandatory.")
        return redirect('verification_portal')

    try:
        # Validate magic bytes and store in private quarantine
        file_meta = DocumentSecurityValidator.validate_and_quarantine(uploaded_file)

        # Create verification record
        req_record = VerificationRequest.objects.create(
            user=request.user,
            category=category,
            army_service_number=army_no,
            rank=rank,
            regiment=regiment,
            ppo_number=ppo_no or None,
            stored_filename=file_meta['safe_filename'],
            original_filename=file_meta['original_filename'],
            file_size_bytes=file_meta['file_size'],
            mime_type=file_meta['mime_type'],
            file_sha256=file_meta['file_hash'],
            status=VerificationStatus.PENDING
        )

        # Audit Event
        SecurityService.log_event(
            event_type="DOCUMENT_UPLOADED",
            actor_email=request.user.email,
            actor_role=request.user.role,
            ip_address=SecurityService.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details=f"Verification Request {req_record.id} created. SHA256: {file_meta['file_hash'][:16]}..."
        )

        messages.success(request, "Proof document uploaded securely. Pending administrator review.")
        return redirect('verification_portal')

    except ValidationError as e:
        messages.error(request, str(e.message if hasattr(e, 'message') else e))
        return redirect('verification_portal')


@login_required
@require_http_methods(["GET"])
def protected_document_download(request, request_id):
    """
    Streams a private document.
    Access is strictly restricted to:
    1. The personnel who uploaded the document.
    2. An authorized Defense Administrator.
    Prevents IDOR (OWASP A01:2021 - Broken Access Control).
    """
    v_request = get_object_or_404(VerificationRequest, id=request_id)

    # Authorization Check
    is_owner = (v_request.user == request.user)
    is_admin = request.user.is_admin

    if not (is_owner or is_admin):
        SecurityService.log_event(
            event_type="UNAUTHORIZED_DOCUMENT_ACCESS_ATTEMPT",
            actor_email=request.user.email,
            actor_role=request.user.role,
            ip_address=SecurityService.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details=f"IDOR attempt: User tried to access document {request_id} belonging to {v_request.user.email}."
        )
        raise PermissionDenied("You are not authorized to view this document proof.")

    # Resolve file inside private enclave
    storage_dir = Path(settings.PRIVATE_DOCUMENT_STORAGE_DIR)
    file_path = storage_dir / v_request.stored_filename

    # Defensive path containment check
    if not str(file_path.resolve()).startswith(str(storage_dir.resolve())) or not file_path.exists():
        raise Http404("Document could not be located in secure enclave.")

    # Audit Document Access
    SecurityService.log_event(
        event_type="DOCUMENT_ACCESSED",
        actor_email=request.user.email,
        actor_role=request.user.role,
        ip_address=SecurityService.get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        details=f"Document {v_request.stored_filename} accessed by {request.user.email} (Role: {request.user.role})."
    )

    # Stream response with strict no-cache headers
    response = FileResponse(open(file_path, 'rb'), content_type=v_request.mime_type)
    response['Content-Disposition'] = f'inline; filename="{v_request.original_filename}"'
    response['Cache-Control'] = 'private, no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response


@login_required
@role_required(Role.ADMINISTRATOR)
@require_http_methods(["POST"])
def admin_adjudicate_request(request, request_id):
    """
    Enables administrator to approve or reject a military credential request.
    """
    v_request = get_object_or_404(VerificationRequest, id=request_id)
    new_status = request.POST.get('status')
    notes = request.POST.get('notes', '')

    if new_status not in (VerificationStatus.APPROVED, VerificationStatus.REJECTED):
        return JsonResponse({'error': 'Invalid status update.'}, status=400)

    v_request.status = new_status
    v_request.reviewed_by = request.user
    v_request.reviewed_at = timezone.now()
    v_request.reviewer_notes = notes
    v_request.save()

    # Update User verification status
    if new_status == VerificationStatus.APPROVED:
        v_request.user.is_verified_military = True
        v_request.user.save()

    SecurityService.log_event(
        event_type=f"VERIFICATION_{new_status}",
        actor_email=request.user.email,
        actor_role=request.user.role,
        ip_address=SecurityService.get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        details=f"Verification request {v_request.id} for {v_request.army_service_number} set to {new_status}."
    )

    return JsonResponse({
        'status': 'success',
        'message': f"Request {v_request.id} has been marked as {new_status}."
    })

