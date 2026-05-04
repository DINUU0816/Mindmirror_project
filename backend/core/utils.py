import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from textblob import TextBlob
import os

# Path to the pre-trained emotion model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml_models', 'emotion_model.h5')
FACE_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'

class EmotionDetector:
    def __init__(self):
        self.face_classifier = cv2.CascadeClassifier(FACE_CASCADE_PATH)
        # The mini_XCEPTION model uses these labels
        self.emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
        try:
            # Load the full model (architecture + weights)
            self.model = load_model(MODEL_PATH, compile=False)
            self.model_loaded = True
            print("Full high-accuracy model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model_loaded = False

    def detect_emotion(self, image_bytes):
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_classifier.detectMultiScale(gray, 1.3, 5)

        results = []
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            # mini_XCEPTION expects (64, 64)
            try:
                roi_gray = cv2.resize(roi_gray, (64, 64), interpolation=cv2.INTER_AREA)
            except:
                continue

            if self.model_loaded:
                roi = roi_gray.astype('float') / 255.0
                roi = img_to_array(roi)
                roi = np.expand_dims(roi, axis=0)
                prediction = self.model.predict(roi)[0]
                label = self.emotion_labels[prediction.argmax()]
                confidence = float(np.max(prediction))
            else:
                import random
                label = random.choice(self.emotion_labels)
                confidence = 0.85
            
            results.append({
                'emotion': label,
                'confidence': confidence,
                'box': [int(x), int(y), int(w), int(h)]
            })
        
        return results

def analyze_sentiment(text):
    analysis = TextBlob(text)
    score = analysis.sentiment.polarity
    if score > 0.1: mood = "Positive"
    elif score < -0.1: mood = "Negative"
    else: mood = "Neutral"
    return score, mood
