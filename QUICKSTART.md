# Quick Start Commands

# 1. Install dependencies
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 2. Configure environment
Copy-Item .env.example .env
# Then edit .env with your settings

# 3. Run the server
python run.py

# 4. Visit http://127.0.0.1:5000
