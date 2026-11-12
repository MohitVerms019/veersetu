"""
VEER SETU 🇮🇳 - Admin Security Dashboard Controller
Provides security operations telemetry, user governance & queue monitoring.
"""

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.contrib import messages

from authentication.models import User, Role, AccountSecurity, SecurityAuditLog
from authentication.decorators import role_required, admin_mfa_required
from authentication.security_service import SecurityService
from verification.models import VerificationRequest, VerificationStatus


@login_required
@role_required(Role.ADMINISTRATOR)
def security_dashboard_view(request):
    """
    Renders the defense administrator security command center.
    """
    total_users = User.objects.count()
    pending_count = VerificationRequest.objects.filter(status=VerificationStatus.PENDING).count()
    verified_count = User.objects.filter(is_verified_military=True).count()
    
    # Suspicious accounts: failed attempts > 0 or actively locked
    locked_accounts_count = AccountSecurity.objects.filter(
        locked_until__gt=timezone.now()
    ).count()

    # Recent Audit Events (last 50)
    recent_audits = SecurityAuditLog.objects.all()[:50]

    # Verification Queue
    verification_queue = VerificationRequest.objects.filter(
        status=VerificationStatus.PENDING
    ).select_related('user')[:20]

    context = {
        'total_users': total_users,
        'pending_count': pending_count,
        'verified_count': verified_count,
        'locked_accounts_count': locked_accounts_count,
        'recent_audits': recent_audits,
        'verification_queue': verification_queue,
    }

    return render(request, "admin_dashboard.html", context)


@login_required
@role_required(Role.ADMINISTRATOR)
@admin_mfa_required
def unlock_account_view(request, user_id):
    """
    Administrator action to manually release an account from brute-force lockout.
    Protected by mandatory re-authentication / MFA check.
    """
    target_user = get_object_or_404(User, id=user_id)
    sec_profile = target_user.security_profile
    sec_profile.reset_failed_attempts(current_ip=SecurityService.get_client_ip(request))

    SecurityService.log_event(
        event_type="ADMIN_UNLOCKED_USER",
        actor_email=request.user.email,
        actor_role=request.user.role,
        ip_address=SecurityService.get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        details=f"Admin released account lockout on user {target_user.email}."
    )

    messages.success(request, f"Account for {target_user.email} has been unlocked.")
    return redirect('admin_dashboard')


@login_required
@role_required(Role.ADMINISTRATOR)
def security_audit_api(request):
    """
    JSON API for live monitoring streams in SOC consoles.
    """
    logs = SecurityAuditLog.objects.all()[:50]
    data = [
        {
            'timestamp': log.timestamp.isoformat(),
            'event_type': log.event_type,
            'actor_email': log.actor_email,
            'actor_role': log.actor_role,
            'ip_address': log.ip_address,
            'details': log.details,
        }
        for log in logs
    ]
    return JsonResponse({'status': 'success', 'events': data})

