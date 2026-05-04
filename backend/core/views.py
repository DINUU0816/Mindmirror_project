from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.utils import timezone
from .models import User, EmotionRecord, JournalEntry, Recommendation, UserStats
from .serializers import UserSerializer, EmotionRecordSerializer, JournalEntrySerializer, RecommendationSerializer, UserStatsSerializer
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
        serializer.save(user=self.request.user)
        # Update user stats
        stats, created = UserStats.objects.get_or_create(user=self.request.user)
        stats.total_checkins += 1
        stats.last_checkin = timezone.now().date()
        stats.save()

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
