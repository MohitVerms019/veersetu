"""
VEER SETU 🇮🇳 - Production-Hardened Security Settings
Compliance: OWASP Top 10, DPDP Act (India), Defense-in-Depth
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# --- 1. CORE CRYPTOGRAPHIC SETTINGS ---
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY', 
    'django-insecure-defense-hardened-key-change-in-production-deployments-64chars'
)

# Debug must strictly remain FALSE in production
DEBUG = os.environ.get('DJANGO_DEBUG', 'False').lower() in ('true', '1')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')

# --- 2. INSTALLED APPLICATIONS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party
    'rest_framework',

    # Veer Setu Custom Security Modules
    'authentication',
    'verification',
    'admin_dashboard',
]

# --- 3. CUSTOM USER MODEL ---
AUTH_USER_MODEL = 'authentication.User'

# --- 4. ADVANCED PASSWORD HASHERS (Argon2id & bcrypt) ---
PASSWORD_HASHERS = [
    # Argon2id: Winner of the Password Hashing Competition (Memory-hard against GPU/ASIC attacks)
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    # BCrypt fallback with SHA-256 pre-hashing
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    # PBKDF2 with 720,000 iterations (NIST approved)
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
]

# --- 5. ENTERPRISE PASSWORD VALIDATION ---
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 10},  # Military-grade 10 chars minimum
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# --- 6. DEFENSE-IN-DEPTH MIDDLEWARE PIPELINE ---
MIDDLEWARE = [
    # Custom Security Headers Middleware (CSP, HSTS, X-Frame-Options)
    'authentication.middleware.SecurityHeadersMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    
    # CSRF Protection (Strict Token Checking)
    'django.middleware.csrf.CsrfViewMiddleware',
    
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    
    # Anti-Clickjacking
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # Veer Setu Custom Behavioral Security Middleware
    'authentication.middleware.SessionTimeoutMiddleware',
    'authentication.middleware.AccountLockoutMiddleware',
    'authentication.middleware.AuditLogMiddleware',
]

ROOT_URLCONF = 'veersetu_sec.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'veersetu_sec.wsgi.application'

# --- 7. SECURE MYSQL DATABASE CONFIGURATION ---
# Uses parameterized queries and prevents SQL Injection via Django ORM
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'veersetu_sec_db'),
        'USER': os.environ.get('DB_USER', 'veersetu_db_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'SecurePass2026!'),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'",
        },
    }
}

# Fallback to local SQLite for development testing when MySQL is not provisioned
if not os.environ.get('DB_NAME'):
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'veersetu_dev.sqlite3',
    }

# --- 8. SESSION & COOKIE SECURITY ---
# Automatic session expiration (15 minutes of inactivity)
SESSION_COOKIE_AGE = int(os.environ.get('SESSION_COOKIE_AGE', 900))  # 900 seconds = 15 mins
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Mitigate XSS cookie theft & Mitigate Session Hijacking
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'True') == 'True'
SESSION_COOKIE_SAMESITE = 'Strict'

# CSRF Cookie Hardening
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'True') == 'True'
CSRF_COOKIE_SAMESITE = 'Strict'

# Anti-Clickjacking: Disallow embedding anywhere
X_FRAME_OPTIONS = 'DENY'

# Prevent MIME-sniffing
SECURE_CONTENT_TYPE_NOSNIFF = True

# Enforce HTTPS HSTS
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# --- 9. PRIVATE DOCUMENT ENCLAVE STORAGE ---
# Uploaded Army Documents are NEVER placed in public static or media folders!
# They reside in an isolated private directory accessible only through authorized backend views
PRIVATE_DOCUMENT_STORAGE_DIR = Path(
    os.environ.get('PRIVATE_STORAGE_ROOT', BASE_DIR / 'private_enclave_documents')
)
PRIVATE_DOCUMENT_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Maximum file size: 5 Megabytes
MAX_DOCUMENT_UPLOAD_SIZE = 5 * 1024 * 1024

# Whitelist of allowed extensions and magic bytes
ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']
ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

# --- 10. BRUTE FORCE / RATE LIMITING PARAMETERS ---
MAX_LOGIN_FAILURES = 5
ACCOUNT_LOCKOUT_DURATION_MINUTES = 30

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

