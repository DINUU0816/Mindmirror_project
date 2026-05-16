from datetime import datetime
from collections import Counter

EMOTION_SENTIMENT = {
    'Happy': 0.8,
    'Surprise': 0.4,
    'Neutral': 0.0,
    'Sad': -0.6,
    'Angry': -0.7,
    'Fear': -0.65,
    'Disgust': -0.75,
}

EMOTION_STRESS = {
    'Happy': 10,
    'Surprise': 30,
    'Neutral': 40,
    'Sad': 70,
    'Angry': 80,
    'Fear': 85,
    'Disgust': 90,
}

NEGATIVE_EMOTIONS = {'Sad', 'Angry', 'Fear', 'Disgust'}


def normalize_score(value, min_value=-1.0, max_value=1.0):
    return int(((value - min_value) / (max_value - min_value)) * 100)


def safe_average(values):
    return sum(values) / len(values) if values else 0.0


def build_mood_timeline(history):
    timeline = []
    for record in reversed(history):
        timeline.append({
            'timestamp': record.timestamp.isoformat(),
            'emotion': record.detected_emotion,
            'stress_level': record.stress_level,
            'stability': record.emotional_stability_score,
        })
    return timeline


def build_weekly_heatmap(history):
    week_counts = {day: {emotion: 0 for emotion in EMOTION_SENTIMENT} for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
    for record in history:
        day = record.timestamp.strftime('%a')
        if day in week_counts:
            week_counts[day][record.detected_emotion] += 1

    heatmap = []
    for day, emotions in week_counts.items():
        heatmap.append({
            'day': day,
            'scores': emotions,
            'total': sum(emotions.values())
        })
    return heatmap


def compute_emotional_volatility(history):
    if not history:
        return 0.0
    values = [EMOTION_SENTIMENT.get(record.detected_emotion, 0.0) for record in history]
    mean = safe_average(values)
    volatility = safe_average([(val - mean) ** 2 for val in values]) ** 0.5
    return round(volatility * 100, 1)


def derive_burnout_risk(history):
    if not history:
        return 'Low'
    negative_streak = 0
    max_negative_streak = 0
    negative_events = 0
    for record in history:
        if record.detected_emotion in NEGATIVE_EMOTIONS:
            negative_streak += 1
            negative_events += 1
            max_negative_streak = max(max_negative_streak, negative_streak)
        else:
            negative_streak = 0

    negative_rate = negative_events / len(history)
    if max_negative_streak >= 4 or negative_rate >= 0.6:
        return 'High'
    if max_negative_streak >= 2 or negative_rate >= 0.4:
        return 'Moderate'
    return 'Low'


def calculate_stability_score(history):
    if not history:
        return 100.0
    weighted = [EMOTION_SENTIMENT.get(record.detected_emotion, 0.0) * (1 - record.stress_level / 100) for record in history]
    score = safe_average(weighted)
    return max(0.0, min(100.0, normalize_score(score)))


def map_recovery_speed(score):
    if score > 75:
        return 'Quick'
    if score > 50:
        return 'Moderate'
    return 'Slow'


def detect_crisis(history):
    if not history:
        return False
    negative_bursts = 0
    streak = 0
    for record in history:
        if record.detected_emotion in NEGATIVE_EMOTIONS and record.stress_level >= 70:
            streak += 1
            negative_bursts += 1
        else:
            streak = 0
    return streak >= 3 or negative_bursts >= 5


def build_emotional_profile(history):
    if not history:
        return {
            'dominant_emotion': 'Neutral',
            'emotional_stability_score': 100.0,
            'burnout_risk': 'Low',
            'recovery_speed': 'Moderate',
            'stress_pattern': 'Balanced',
            'peak_positive_period': 'Unknown',
        }

    emotion_counts = Counter([record.detected_emotion for record in history])
    dominant_emotion = emotion_counts.most_common(1)[0][0]
    stability_score = calculate_stability_score(history)
    burnout_risk = derive_burnout_risk(history)

    positive_records = [r for r in history if r.detected_emotion in ['Happy', 'Surprise']]
    if positive_records:
        peak_positive_period = max(positive_records, key=lambda r: r.sentiment_score).timestamp.strftime('%A Evening')
    else:
        peak_positive_period = 'Unknown'

    stress_levels = [record.stress_level for record in history]
    avg_stress = safe_average(stress_levels)
    pattern = 'Low stress' if avg_stress < 40 else 'Moderate stress' if avg_stress < 70 else 'High stress'

    return {
        'dominant_emotion': dominant_emotion,
        'emotional_stability_score': stability_score,
        'burnout_risk': burnout_risk,
        'recovery_speed': map_recovery_speed(stability_score),
        'stress_pattern': pattern,
        'peak_positive_period': peak_positive_period,
    }


def generate_wellness_recommendations(profile, history):
    recommendations = []
    burnout_risk = profile.get('burnout_risk', 'Low')
    stability = profile.get('emotional_stability_score', 100.0)
    dominant = profile.get('dominant_emotion', 'Neutral')

    if burnout_risk == 'High':
        recommendations.append('You are showing signs of burnout. Take a longer digital detox and rest deeply.')
    elif burnout_risk == 'Moderate':
        recommendations.append('Your energy is strained. Schedule short mindfulness breaks and reduce background stress.')
    else:
        recommendations.append('Your rhythm is stable. Keep tracking and stay consistent with your self-care routines.')

    if dominant in ['Sad', 'Angry', 'Fear', 'Disgust']:
        recommendations.append('Try a breathing exercise and journal about the emotion to release tension.')
    else:
        recommendations.append('Celebrate small wins and keep the positive notes flowing into your day.')

    if stability < 50:
        recommendations.append('Build a bedtime reset routine to improve recovery speed and reset your mood.')

    return recommendations


def analyze_history(history):
    profile = build_emotional_profile(history)
    timeline = build_mood_timeline(history)
    heatmap = build_weekly_heatmap(history)
    volatility = compute_emotional_volatility(history)
    crisis = detect_crisis(history)
    recommendations = generate_wellness_recommendations(profile, history)

    return {
        'profile': profile,
        'timeline': timeline,
        'heatmap': heatmap,
        'volatility': volatility,
        'crisis': crisis,
        'recommendations': recommendations,
    }
