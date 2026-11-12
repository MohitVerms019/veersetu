"""
VEER SETU 🇮🇳 - Master URL Configuration
Protected endpoint dispatching with strict permission gates.
"""

from django.contrib import admin
from django.urls import path
from authentication import views as auth_views
from verification import views as verify_views
from admin_dashboard import views as dashboard_views

urlpatterns = [
    # Django Built-in Admin (Protected)
    path('admin/', admin.site.urls),

    # Authentication Endpoints
    path('login/', auth_views.login_view, name='login'),
    path('register/', auth_views.register_view, name='register'),
    path('logout/', auth_views.logout_view, name='logout'),
    path('logout-all/', auth_views.logout_all_devices_view, name='logout_all'),
    path('password-reset/', auth_views.password_reset_request_view, name='password_reset_request'),

    # Document Verification & Protected Streaming
    path('verification/upload/', verify_views.upload_verification_document, name='verification_upload'),
    path('verification/document/<int:request_id>/', verify_views.protected_document_download, name='protected_document_download'),
    path('verification/adjudicate/<int:request_id>/', verify_views.admin_adjudicate_request, name='admin_adjudicate_request'),

    # Security Command Dashboard
    path('security-dashboard/', dashboard_views.security_dashboard_view, name='admin_dashboard'),
    path('security-dashboard/unlock/<int:user_id>/', dashboard_views.unlock_account_view, name='unlock_account'),
    path('api/security-telemetry/', dashboard_views.security_audit_api, name='audit_stream_api'),
]

