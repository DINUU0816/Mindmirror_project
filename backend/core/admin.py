from django.contrib import admin
from .models import User, EmotionRecord, JournalEntry, Recommendation, UserStats

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_staff')

@admin.register(EmotionRecord)
class EmotionRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'emotion', 'confidence', 'timestamp')
    list_filter = ('emotion', 'timestamp')

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'detected_mood', 'created_at')

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('category', 'emotion_target', 'title')

@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'emotional_health_score', 'current_streak')
