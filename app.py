"""
Flask Backend for Boysun School Website
Provides security features and contact form handling
"""
import os
import re
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from email_validator import validate_email, EmailNotValidError
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging
import json
from flask import session

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, 
            static_folder='.',
            template_folder='.')

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(32).hex())
app.config['WTF_CSRF_TIME_LIMIT'] = None  # CSRF tokens don't expire

# Initialize security extensions
csrf = CSRFProtect(app)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Security headers with Talisman
csp = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'"]
}

Talisman(app, 
         content_security_policy=csp,
         force_https=False)  # Set to True in production with HTTPS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Admin Credentials (as requested)
ADMIN_LOGIN = "boysun"
ADMIN_PASS = "boysun2026.09"

# Simple JSON Databases
NEWS_DB = 'news.json'
TEACHERS_DB = 'teachers.json'
SETTINGS_DB = 'settings.json'

def load_db(filename, default=[]):
    if not os.path.exists(filename):
        with open(filename, 'w') as f:
            json.dump(default, f)
    with open(filename, 'r') as f:
        return json.load(f)

def save_db(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f)

# Legacy aliases for compatibility
def load_news_db(): return load_db(NEWS_DB)
def save_news_db(data): save_db(NEWS_DB, data)
def sanitize_input(text, max_length=1000):
    """Sanitize user input to prevent XSS"""
    if not text:
        return ""
    
    # Remove any HTML tags
    text = re.sub(r'<[^>]*>', '', str(text))
    
    # Limit length
    text = text[:max_length]
    
    # Remove potentially dangerous characters
    text = text.replace('<', '').replace('>', '').replace('"', '').replace("'", '')
    
    return text.strip()


def validate_phone(phone):
    """Validate phone number format"""
    # Uzbekistan phone format: +998 XX XXX XX XX
    pattern = r'^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$'
    return re.match(pattern, phone.replace('-', ' ')) is not None


def validate_contact_form(data):
    """Validate contact form data"""
    errors = []
    
    # Validate name
    if not data.get('name') or len(data['name'].strip()) < 2:
        errors.append("Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    
    # Validate email
    try:
        email = data.get('email', '').strip()
        validate_email(email)
    except EmailNotValidError:
        errors.append("Noto'g'ri email manzil")
    
    # Validate phone
    phone = data.get('phone', '').strip()
    if phone and not validate_phone(phone):
        errors.append("Telefon raqami +998 XX XXX XX XX formatida bo'lishi kerak")
    
    # Validate message
    if not data.get('message') or len(data['message'].strip()) < 10:
        errors.append("Xabar kamida 10 ta belgidan iborat bo'lishi kerak")
    
    return errors


def send_email(name, email, phone, message):
    """Send email with contact form data"""
    # Email configuration from environment
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_username = os.getenv('SMTP_USERNAME')
    smtp_password = os.getenv('SMTP_PASSWORD')
    recipient_email = os.getenv('RECIPIENT_EMAIL', 'odilovdilmurod020@gmail.com')
    
    if not smtp_username or not smtp_password:
        logger.warning("Email credentials not configured")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Yangi xabar - Boysun IM veb-saytidan'
        msg['From'] = smtp_username
        msg['To'] = recipient_email
        
        # Email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">Yangi Bog'lanish So'rovi</h2>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Ism:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Telefon:</strong> {phone}</p>
                    <p><strong>Xabar:</strong></p>
                    <p style="background: white; padding: 15px; border-left: 4px solid #2563eb;">
                        {message}
                    </p>
                </div>
                <p style="color: #64748b; font-size: 12px;">
                    Yuborilgan vaqt: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                </p>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully from {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False


# Authentication Decorator
def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function


# Routes
@app.route('/')
def index():
    """Serve index.html"""
    return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('.', path)


@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Get CSRF token for forms"""
    token = generate_csrf()
    return jsonify({'csrf_token': token})


@app.route('/api/contact', methods=['POST'])
@limiter.limit("5 per 15 minutes")  # Rate limit: 5 submissions per 15 minutes
def contact_form():
    """Handle contact form submission"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Malumot topilmadi'
            }), 400
        
        # Sanitize inputs
        name = sanitize_input(data.get('name', ''), 100)
        email = sanitize_input(data.get('email', ''), 100)
        phone = sanitize_input(data.get('phone', ''), 20)
        message = sanitize_input(data.get('message', ''), 2000)
        
        # Validate data
        validation_errors = validate_contact_form({
            'name': name,
            'email': email,
            'phone': phone,
            'message': message
        })
        
        if validation_errors:
            return jsonify({
                'success': False,
                'errors': validation_errors
            }), 400
        
        # Send email
        email_sent = send_email(name, email, phone, message)
        
        if email_sent:
            return jsonify({
                'success': True,
                'message': 'Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog\'lanamiz.'
            })
        else:
            # Even if email fails, acknowledge receipt
            logger.warning(f"Contact form submitted but email not sent: {name} ({email})")
            return jsonify({
                'success': True,
                'message': 'Xabaringiz qabul qilindi. Tez orada siz bilan bog\'lanamiz.'
            })
            
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.'
        }), 500


# Admin API
@app.route('/api/admin/login', methods=['POST'])
@csrf.exempt  # Exempt for simplicity in this specific task
def admin_login():
    data = request.get_json()
    if data.get('login') == ADMIN_LOGIN and data.get('password') == ADMIN_PASS:
        session['logged_in'] = True
        return jsonify({'success': True})
    return jsonify({'error': 'Xato login yoki parol'}), 401

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('logged_in', None)
    return jsonify({'success': True})

@app.route('/api/admin/status', methods=['GET'])
def admin_status():
    return jsonify({'logged_in': session.get('logged_in', False)})

# News API
@app.route('/api/news', methods=['GET'])
def get_news():
    return jsonify(load_news_db())

@app.route('/api/news', methods=['POST'])
@admin_required
@csrf.exempt
def add_news():
    data = request.get_json()
    news = load_news_db()
    # Robust unique ID generation
    new_id = max([n.get('id', 0) for n in news], default=0) + 1
    new_entry = {
        'id': new_id,
        'title': sanitize_input(data.get('title'), 200),
        'date': sanitize_input(data.get('date'), 50),
        'content': sanitize_input(data.get('content'), 5000),
        'image': data.get('image') # Base64 image data
    }
    news.insert(0, new_entry) # Add to top
    save_news_db(news)
    return jsonify({'success': True, 'news': new_entry})

@app.route('/api/news/<int:news_id>', methods=['PUT'])
@admin_required
@csrf.exempt
def update_news(news_id):
    data = request.get_json()
    news = load_news_db()
    for item in news:
        if item['id'] == news_id:
            item['title'] = sanitize_input(data.get('title'), 200)
            item['date'] = sanitize_input(data.get('date'), 50)
            item['content'] = sanitize_input(data.get('content'), 5000)
            if data.get('image'):
                item['image'] = data.get('image')
            save_news_db(news)
            return jsonify({'success': True})
    return jsonify({'error': 'Yangilik topilmadi'}), 404

@app.route('/api/news/<int:news_id>', methods=['DELETE'])
@admin_required
@csrf.exempt
def delete_news(news_id):
    news = load_news_db()
    news = [n for n in news if n['id'] != news_id]
    save_news_db(news)
    return jsonify({'success': True})

# Teachers API
@app.route('/api/teachers', methods=['GET'])
def get_teachers():
    return jsonify(load_db(TEACHERS_DB))

@app.route('/api/teachers', methods=['POST'])
@admin_required
@csrf.exempt
def add_teacher():
    data = request.get_json()
    teachers = load_db(TEACHERS_DB)
    new_id = max([t.get('id', 0) for t in teachers], default=0) + 1
    new_teacher = {
        'id': new_id,
        'name': sanitize_input(data.get('name'), 100),
        'subject': sanitize_input(data.get('subject'), 100),
        'image': data.get('image')
    }
    teachers.append(new_teacher)
    save_db(TEACHERS_DB, teachers)
    return jsonify({'success': True})

@app.route('/api/teachers/<int:tid>', methods=['DELETE'])
@admin_required
@csrf.exempt
def delete_teacher(tid):
    teachers = load_db(TEACHERS_DB)
    teachers = [t for t in teachers if t['id'] != tid]
    save_db(TEACHERS_DB, teachers)
    return jsonify({'success': True})

# Settings API
@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify(load_db(SETTINGS_DB, default={"site_name": "Boysun IM", "phone": "+998 91 989 89 98"}))

@app.route('/api/settings', methods=['POST'])
@admin_required
@csrf.exempt
def update_settings():
    data = request.get_json()
    save_db(SETTINGS_DB, data)
    return jsonify({'success': True})


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


# Error handlers
@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit errors"""
    return jsonify({
        'success': False,
        'error': 'Juda ko\'p so\'rov yuborildi. Iltimos bir oz kuting.'
    }), 429


@app.errorhandler(400)
def bad_request_handler(e):
    """Handle bad requests"""
    return jsonify({
        'success': False,
        'error': 'Noto\'g\'ri so\'rov'
    }), 400


@app.errorhandler(500)
def internal_error_handler(e):
    """Handle internal errors"""
    logger.error(f"Internal error: {str(e)}")
    return jsonify({
        'success': False,
        'error': 'Server xatoligi. Iltimos qaytadan urinib ko\'ring.'
    }), 500


if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='127.0.0.1', port=5000)
