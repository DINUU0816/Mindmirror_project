from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserProfileView, EmotionViewSet, JournalViewSet,
    RecommendationViewSet, EmotionDetectionView, AnalyticsView, MoodInsightsView,
    EmotionHistoryView, EmotionalProfileView, WellnessInsightView,
    EmotionalStabilityView, BurnoutRiskView
)

router = DefaultRouter()
router.register(r'emotions', EmotionViewSet, basename='emotion')
router.register(r'journals', JournalViewSet, basename='journal')
router.register(r'recommendations', RecommendationViewSet, basename='recommendation')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('detect/', EmotionDetectionView.as_view(), name='emotion_detect'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('insights/', MoodInsightsView.as_view(), name='insights'),
    path('emotion-history/', EmotionHistoryView.as_view(), name='emotion_history'),
    path('emotional-profile/', EmotionalProfileView.as_view(), name='emotional_profile'),
    path('wellness-insights/', WellnessInsightView.as_view(), name='wellness_insights'),
    path('emotional-stability/', EmotionalStabilityView.as_view(), name='emotional_stability'),
    path('burnout-risk/', BurnoutRiskView.as_view(), name='burnout_risk'),
]
