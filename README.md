# Mind Mirror

Mind Mirror is an AI-driven emotional wellness platform that transforms facial and text-based mood signals into intelligent wellness guidance.

## Features
- Real-time facial emotion recognition
- Sentiment analysis for journaling
- Personalized AI wellness recommendations
- Emotion trend analytics and drift visualization
- Burnout risk detection and crisis alerts
- Emotional digital twin profiling

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Recharts for analytics
- Framer Motion for micro-interactions

### Backend
- Django
- Django REST Framework
- Simple JWT authentication

### Database
- SQLite (local development)

### AI / ML
- TensorFlow / Keras emotion model
- Light-weight emotional trend analysis
- Behavioral scoring engine
- Wellness recommendation engine

## New Emotional Intelligence Module
This update adds the **Emotional Drift & Predictive Wellness Intelligence System** and includes:
- Emotional history tracking
- Emotional stability scoring
- Burnout risk prediction
- AI wellness recommendations
- Behavioral emotional profiles
- Weekly emotion heatmaps
- Crisis detection alerts

## Updated Backend APIs
New endpoints added under `/api/`:
- `GET /api/emotion-history/` — emotion trend history and heatmap
- `GET /api/emotional-profile/` — emotional digital twin summary
- `GET /api/wellness-insights/` — latest AI wellness suggestions
- `GET /api/emotional-stability/` — stability score and volatility
- `GET /api/burnout-risk/` — burnout risk and recovery insights

## Setup & Installation

### Initial Setup (One-time)
```powershell
# From project root
cd mindmirror_project

# Install backend dependencies
pip install -r requirements.txt

# Run database migrations
cd backend
python manage.py migrate
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Running the Project

Open **two separate terminals** in the project root and run:

### Terminal 1: Backend Server
```powershell
cd C:\Users\ASUS\Downloads\mindmirror_project\mindmirror_project\backend
& "C:\Users\ASUS\Downloads\mindmirror_project\.venv\Scripts\Activate.ps1"
python manage.py runserver 8000
```
Backend runs at: `http://localhost:8000/api/`

### Terminal 2: Frontend Server
```powershell
cd C:\Users\ASUS\Downloads\mindmirror_project\mindmirror_project\frontend
npm run dev
```
Frontend runs at: `http://localhost:5173/`

## Screenshots
_Add screenshots of the dashboard, emotion trend graphs, and AI wellness insights here once available._

## Project Folder
```bash
backend/
frontend/
ml_models/
README.md
```

## Notes
- New emotional intelligence logic is implemented in `ml_models/emotional_analysis.py`.
- New models are added in `backend/core/models.py`.
- Dashboard enhancements are in `frontend/src/pages/Dashboard.tsx`.
- Database migrations are available in `backend/core/migrations/0002_emotional_intelligence.py`.
