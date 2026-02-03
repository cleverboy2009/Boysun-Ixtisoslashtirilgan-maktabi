# Boysun IM Website - Setup Instructions

## Python Backend with Security Features

### 🔐 Security Features Included:
- ✅ CSRF Protection (Cross-Site Request Forgery)
- ✅ Rate Limiting (5 submissions per 15 minutes)
- ✅ Input Validation & Sanitization
- ✅ XSS Protection Headers
- ✅ Secure Contact Form with Email Integration

---

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

---

## 🚀 Quick Start

### 1. Install Python Dependencies

Open PowerShell or Command Prompt in the project folder and run:

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

1. Copy `.env.example` to create `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` file and update with your settings:
   - Change `SECRET_KEY` to a random string
   - Configure email settings (see Email Setup section below)

### 3. Run the Server

```powershell
python run.py
```

The website will be available at: **http://127.0.0.1:5000**

---

## 📧 Email Setup (For Contact Form)

### Option 1: Gmail (Recommended for Testing)

1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Factor Authentication if not already enabled
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Create a new App Password for "Mail"
5. Copy the 16-character password

Update `.env` file:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
RECIPIENT_EMAIL=odilovdilmurod020@gmail.com
```

### Option 2: Other Email Providers

#### Outlook/Hotmail:
```
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
```

#### Yahoo:
```
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
```

---

## 🧪 Testing

### Test 1: Basic Server Health
Visit: http://127.0.0.1:5000/api/health

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T..."
}
```

### Test 2: Contact Form
1. Go to: http://127.0.0.1:5000/contact.html
2. Fill out the form with valid data
3. Submit and check for success message
4. Check recipient email for the message

### Test 3: Rate Limiting
1. Submit the contact form 5 times rapidly
2. The 6th submission should show rate limit error

### Test 4: Input Validation
Try submitting:
- Empty name (should reject)
- Invalid email (should reject)
- Invalid phone format (should reject)
- Short message < 10 chars (should reject)

---

## 🎯 Production Deployment

### 1. Update Configuration

In `.env`:
```
SECRET_KEY=generate-a-strong-random-key-here
FORCE_HTTPS=True
```

### 2. Use Production WSGI Server

Install Gunicorn (for Linux/Mac) or Waitress (for Windows):

**Windows:**
```powershell
pip install waitress
```

Run with Waitress:
```powershell
$env:FLASK_ENV="production"
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

**Linux/Mac:**
```bash
pip install gunicorn
export FLASK_ENV=production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 3. Enable HTTPS

In production, you MUST use HTTPS. Get a free SSL certificate from:
- Let's Encrypt
- Cloudflare
- Your hosting provider

---

## 📁 File Structure

```
my school website/
├── app.py                 # Flask backend application
├── config.py             # Configuration management
├── run.py                # Server runner
├── requirements.txt      # Python dependencies
├── security.js           # Client-side security module
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── script.js            # Main frontend JavaScript
├── style.css            # Styles
├── index.html           # Homepage
├── contact.html         # Contact page (with secure form)
├── about.html           # About page
├── teachers.html        # Teachers page
├── admission.html       # Admission page
└── [other files...]
```

---

## 🔧 Troubleshooting

### Error: "Module not found"
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

### Error: "Email not sending"
- Check SMTP credentials in `.env`
- For Gmail, ensure App Password is used (not regular password)
- Check firewall/antivirus blocking port 587

### Error: "Address already in use"
- Another process is using port 5000
- Change port in `run.py` or kill the other process

---

## 📝 Notes

- The server runs in development mode by default with debug enabled
- Email sending is optional - form will still work without it
- Rate limiting uses in-memory storage (resets on server restart)
- For production, consider using Redis for rate limiting storage

---

## 🆘 Support

For issues or questions:
- Email: odilovdilmurod020@gmail.com
- Phone: +998 91 969 23 63
