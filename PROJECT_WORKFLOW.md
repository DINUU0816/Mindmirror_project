# How Mind Mirror+ Works 🧠✨

Mind Mirror+ is an AI-powered emotional wellness platform that bridges the gap between facial recognition technology and personalized mental health support. Here is a breakdown of how the system operates:

## 1. System Architecture
The application follows a classic **Full-Stack Decoupled Architecture**:
- **Frontend**: A modern React (Vite) application using TypeScript for type safety and Tailwind CSS for a responsive, glassmorphic UI.
- **Backend**: A Django REST Framework (DRF) API that handles business logic, user authentication, and serves as a wrapper for the ML models.
- **Database**: PostgreSQL (or SQLite locally) stores user profiles, emotional history, journal entries, and wellness recommendations.
- **AI/ML Layer**: A specialized pipeline using OpenCV for face detection and a pre-trained Keras/TensorFlow model for emotion classification.

---

## 2. The Core Workflow: Real-Time Emotion Detection

### Step A: Capturing the Feed
The frontend uses the `react-webcam` library to access the user's camera. At regular intervals, it captures a frame as a base64-encoded string.

### Step B: The API Request
This image data is sent to the backend via a `POST /api/detect/` request.

### Step C: Backend Processing (`EmotionDetector` class)
1.  **Decoding**: The backend decodes the base64 string into a raw image format compatible with OpenCV.
2.  **Face Detection**: OpenCV (Haar Cascades or similar) locates the face within the image.
3.  **Preprocessing**: The detected face is cropped, converted to grayscale, and resized to 48x48 pixels to match the model's training input.
4.  **Inference**: The processed image is fed into `emotion_model.h5` (a mini-XCEPTION model trained on the FER2013 dataset).
5.  **Classification**: The model outputs probability scores for 7 emotions: *Happy, Sad, Angry, Neutral, Surprise, Fear, and Disgust*.

### Step D: Response & UI Update
The backend returns the dominant emotion. The frontend then updates the UI in real-time, showing the current mood and fetching relevant wellness recommendations.

---

## 3. Wellness & Insights Engine

### Smart Recommendations
Based on the detected emotion, the system queries the database for `Recommendations`.
- **Happy**: Suggests high-energy exercises or uplifting music.
- **Sad**: Suggests self-compassion meditations or comforting melodies.
- **Angry**: Suggests tension-release exercises (like boxing) or cooling breathwork.

### Reflective Journaling
Users can write journal entries. The backend uses the `TextBlob` library to perform **Sentiment Analysis** on the text. This allows the system to compare "How you look" (Facial AI) with "How you feel" (Textual AI).

### AI Mood Insights
The `AnalyticsView` aggregates historical data to provide trends. A rule-based engine analyzes the last 20 check-ins to provide actionable advice (e.g., "You've been feeling stressed lately; we recommend more mindfulness sessions.").

---

## 4. Security & Authentication
- **JWT (JSON Web Tokens)**: Secure, stateless authentication via `djangorestframework-simplejwt`.
- **Protected Routes**: User data (emotions, journals) is strictly siloed; users can only access their own emotional history.

---

## 5. Technical Requirements for Accuracy
- **Lighting**: Good front-facing lighting is required for the webcam to clearly capture facial features.
- **Orientation**: The user should be facing the camera directly for the best detection results.
- **Model**: The high-accuracy `fer2013_mini_XCEPTION` model ensures professional-grade detection compared to basic mock systems.
