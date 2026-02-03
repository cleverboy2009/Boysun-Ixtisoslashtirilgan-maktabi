"""
Configuration for Flask application
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', os.urandom(32).hex())
    WTF_CSRF_TIME_LIMIT = None
    WTF_CSRF_SSL_STRICT = False  # Set to True in production with HTTPS
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = "memory://"
    
    # Email settings
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL', 'odilovdilmurod020@gmail.com')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FORCE_HTTPS = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FORCE_HTTPS = True
    WTF_CSRF_SSL_STRICT = True


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
