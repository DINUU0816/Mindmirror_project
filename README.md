# Mind Mirror+ 🧠✨
### AI-Powered Emotional Wellness Platform

Mind Mirror+ is a sophisticated full-stack web application that uses real-time facial recognition to detect user emotions, provides deep AI-driven insights, and suggests personalized wellness activities.

---

## 🔥 Features
- **Real-time Emotion Detection**: Live webcam analysis detecting Happy, Sad, Angry, Neutral, Surprise, etc.
- **AI Mood Insights**: Analyzes emotional patterns and generates actionable summaries.
- **Smart Recommendations**: Suggests music, meditation, quotes, and exercises based on your current mood.
- **Reflective Journaling**: Integrated sentiment analysis on journal entries to compare text-based vs facial-based emotions.
- **Premium Analytics**: Interactive charts (Pie & Bar) showing emotional distribution and health scores.
- **Gamification**: Daily streaks and emotional health tracking.
- **Modern UI**: Clean, responsive, glassmorphic design built with Tailwind CSS.

---

## 🛠 Tech Stack
- **Backend**: Django, Django REST Framework, SimpleJWT
- **Database**: PostgreSQL (Default) / SQLite (Fallback)
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons
- **AI/ML**: OpenCV, TensorFlow/Keras, TextBlob (Sentiment Analysis)
- **Charts**: Recharts

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- Webcam (for emotion detection)

### 2. Backend Setup
```bash
cd ..
.venv\Scripts\activate
cd mindmirror_project\backend
pip install -r ../requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver 8000
```

### 3. Frontend Setup
```bash
cd ..\mindmirror_project\frontend
npm install
npm run dev -- --host 127.0.0.1
```

### 4. Run both servers
Open two terminals from the repository root (one level above this README) and run the following commands:

Terminal 1 (backend):
```bash
cd mindmirror_project\backend
..\..\.venv\Scripts\activate
python manage.py runserver 8000
```

Terminal 2 (frontend):
```bash
cd mindmirror_project\frontend
npm run dev -- --host 127.0.0.1
```

### 5. Train a better AI Model
If you want more accurate facial expression recognition, train the model with a labeled emotion dataset.

1. Prepare your dataset as:
   - `ml_models/data/train/<emotion_name>/...`
   - `ml_models/data/test/<emotion_name>/...`

2. Run training from the repository root:
```bash
cd mindmirror_project
.venv\Scripts\python.exe ml_models\train_emotion_model.py --train-dir ml_models\data\train --test-dir ml_models\data\test --save-path ml_models\emotion_model.h5 --epochs 80 --batch-size 32
```

3. After training, the best model is saved to `ml_models/emotion_model.h5`.

The system will then use this improved model for live emotion detection.

### 5. AI Model
The system uses a pre-trained emotion detection model. For the hackathon demo, a robust fallback/mock system is included if `ml_models/emotion_model.h5` is not present, ensuring a seamless experience.

---

## 📸 API Endpoints
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - JWT Login
- `POST /api/detect/` - Detect emotion from image (base64)
- `GET /api/analytics/` - User emotion stats
- `GET /api/insights/` - AI-generated mood insights

---

## 🔮 Future Scope
- **Voice Emotion Analysis**: Integrate audio-based mood detection.
- **Wearable Integration**: Sync with Apple Health / Fitbit for physiological data.
- **AI Therapist Bot**: A GPT-powered companion for deeper conversations.
- **Peer Support Groups**: Anonymous communities based on shared moods.

---

**Built with ❤️ for the AI Wellness Hackathon.**
