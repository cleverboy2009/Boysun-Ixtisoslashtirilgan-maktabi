"""
Production server runner for Boysun School Website
"""
import os
from app import app

if __name__ == '__main__':
    # Get environment
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        # Production settings
        app.run(
            host='0.0.0.0',
            port=int(os.getenv('PORT', 5000)),
            debug=False
        )
    else:
        # Development settings
        print("\n" + "="*50)
        print("🚀 Boysun IM Website Server")
        print("="*50)
        print("📍 Local: http://127.0.0.1:5000")
        print("📍 Network: http://<your-ip>:5000")
        print("="*50 + "\n")
        
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=True
        )
