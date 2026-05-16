from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.utils import timezone
from .models import (
    User, EmotionRecord, EmotionHistory, JournalEntry,
    Recommendation, WellnessInsight, EmotionalProfile, UserStats
)
from .serializers import (
    UserSerializer, EmotionRecordSerializer, EmotionHistorySerializer,
    EmotionalProfileSerializer, WellnessInsightSerializer,
    JournalEntrySerializer, RecommendationSerializer, UserStatsSerializer
)
from .utils import EmotionDetector, analyze_sentiment
import base64

detector = EmotionDetector()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

class EmotionViewSet(viewsets.ModelViewSet):
    serializer_class = EmotionRecordSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return EmotionRecord.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        from ml_models.emotional_analysis import analyze_history, EMOTION_STRESS, EMOTION_SENTIMENT
        
        emotion_record = serializer.save(user=self.request.user)

        stats, created = UserStats.objects.get_or_create(user=self.request.user)
        stats.total_checkins += 1
        stats.last_checkin = timezone.now().date()
        stats.save()

        sentiment_score = EMOTION_SENTIMENT.get(emotion_record.emotion, 0.0)
        stress_level = EMOTION_STRESS.get(emotion_record.emotion, 50)
        burnout_risk = 'Low'
        stability_score = 100.0

        recent_history = EmotionHistory.objects.filter(user=self.request.user).order_by('-timestamp')[:30]
        history_list = list(recent_history)

        if history_list:
            analysis = analyze_history(history_list + [EmotionHistory(
                user=self.request.user,
                detected_emotion=emotion_record.emotion,
                confidence=emotion_record.confidence,
                sentiment_score=sentiment_score,
                stress_level=stress_level,
                burnout_risk='Low',
                emotional_stability_score=100.0,
                timestamp=emotion_record.timestamp
            )])
            burnout_risk = analysis['profile']['burnout_risk']
            stability_score = analysis['profile']['emotional_stability_score']

        emotion_history = EmotionHistory.objects.create(
            user=self.request.user,
            detected_emotion=emotion_record.emotion,
            confidence=emotion_record.confidence,
            sentiment_score=sentiment_score,
            stress_level=stress_level,
            burnout_risk=burnout_risk,
            emotional_stability_score=stability_score,
            timestamp=emotion_record.timestamp
        )

        profile, _ = EmotionalProfile.objects.get_or_create(user=self.request.user)
        analysis = analyze_history(list(EmotionHistory.objects.filter(user=self.request.user).order_by('-timestamp')[:30]))
        profile.dominant_emotion = analysis['profile']['dominant_emotion']
        profile.emotional_stability_score = analysis['profile']['emotional_stability_score']
        profile.burnout_risk = analysis['profile']['burnout_risk']
        profile.recovery_speed = analysis['profile']['recovery_speed']
        profile.stress_pattern = analysis['profile']['stress_pattern']
        profile.peak_positive_period = analysis['profile']['peak_positive_period']
        profile.save()

        WellnessInsight.objects.create(
            user=self.request.user,
            title='Wellness check-in update',
            recommendation=' '.join(analysis['recommendations']),
            risk_level=analysis['profile']['burnout_risk'],
            score=analysis['profile']['emotional_stability_score'],
            is_crisis=analysis['crisis']
        )

class JournalViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        content = self.request.data.get('content', '')
        score, mood = analyze_sentiment(content)
        serializer.save(user=self.request.user, sentiment_score=score, detected_mood=mood)

class RecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RecommendationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        emotion = self.request.query_params.get('emotion')
        if emotion:
            return Recommendation.objects.filter(emotion_target=emotion)
        return Recommendation.objects.all()

class EmotionDetectionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        image_data = request.data.get('image')
        if not image_data:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Handle base64 image
            format, imgstr = image_data.split(';base64,')
            ext = format.split('/')[-1]
            data = base64.b64decode(imgstr)
            
            results = detector.detect_emotion(data)
            return Response(results)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AnalyticsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        # Get emotion counts
        emotion_counts = EmotionRecord.objects.filter(user=user).values('emotion').annotate(count=Count('emotion'))
        
        # Get recent history
        history = EmotionRecord.objects.filter(user=user).order_by('-timestamp')[:10]
        history_serializer = EmotionRecordSerializer(history, many=True)
        
        # Get streak and stats
        stats = get_object_or_404(UserStats, user=user)
        stats_serializer = UserStatsSerializer(stats)
        
        return Response({
            'emotion_counts': emotion_counts,
            'recent_history': history_serializer.data,
            'stats': stats_serializer.data
        })

class MoodInsightsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        recent_emotions = EmotionRecord.objects.filter(user=user).order_by('-timestamp')[:20]
        
        if not recent_emotions:
            return Response({'insight': 'Start tracking your emotions to get AI insights!'})
        
        # Basic rule-based insight
        counts = {}
        for rec in recent_emotions:
            counts[rec.emotion] = counts.get(rec.emotion, 0) + 1
        
        top_emotion = max(counts, key=counts.get)
        insight = f"Based on your last 20 check-ins, you have been feeling {top_emotion} most of the time."
        
        if top_emotion in ['Sad', 'Angry', 'Fear']:
            recommendation = "We suggest trying some meditation or listening to calming music."
        else:
            recommendation = "Keep up the positive vibes!"
            
        return Response({
            'insight': insight,
            'recommendation': recommendation,
            'top_emotion': top_emotion
        })

class EmotionHistoryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from ml_models.emotional_analysis import analyze_history
        
        history = EmotionHistory.objects.filter(user=request.user).order_by('-timestamp')[:30]
        serializer = EmotionHistorySerializer(history, many=True)
        analysis = analyze_history(history)

        return Response({
            'history': serializer.data,
            'timeline': analysis['timeline'],
            'heatmap': analysis['heatmap'],
            'volatility': analysis['volatility'],
            'crisis': analysis['crisis'],
        })

class EmotionalProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        profile, _ = EmotionalProfile.objects.get_or_create(user=request.user)
        serializer = EmotionalProfileSerializer(profile)
        return Response(serializer.data)

class WellnessInsightView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        insights = WellnessInsight.objects.filter(user=request.user).order_by('-created_at')[:5]
        serializer = WellnessInsightSerializer(insights, many=True)
        return Response({
            'insights': serializer.data
        })

class EmotionalStabilityView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from ml_models.emotional_analysis import analyze_history
        
        history = EmotionHistory.objects.filter(user=request.user).order_by('-timestamp')[:30]
        analysis = analyze_history(history)
        return Response({
            'emotional_stability_score': analysis['profile']['emotional_stability_score'],
            'burnout_risk': analysis['profile']['burnout_risk'],
            'stress_pattern': analysis['profile']['stress_pattern'],
            'crisis': analysis['crisis'],
            'volatility': analysis['volatility'],
            'recommendations': analysis['recommendations']
        })

class BurnoutRiskView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from ml_models.emotional_analysis import analyze_history
        
        history = EmotionHistory.objects.filter(user=request.user).order_by('-timestamp')[:30]
        analysis = analyze_history(history)
        return Response({
            'burnout_risk': analysis['profile']['burnout_risk'],
            'dominant_emotion': analysis['profile']['dominant_emotion'],
            'recovery_speed': analysis['profile']['recovery_speed'],
            'peak_positive_period': analysis['profile']['peak_positive_period']
        })
