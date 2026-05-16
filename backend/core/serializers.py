from rest_framework import serializers
from .models import (
    User, EmotionRecord, EmotionHistory, WellnessInsight,
    EmotionalProfile, JournalEntry, Recommendation, UserStats
)

class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStats
        fields = '__all__'

class EmotionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionalProfile
        fields = '__all__'

class WellnessInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessInsight
        fields = '__all__'

class EmotionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionHistory
        fields = '__all__'
        read_only_fields = ('user', 'timestamp', 'burnout_risk', 'emotional_stability_score')

class UserSerializer(serializers.ModelSerializer):
    stats = UserStatsSerializer(read_only=True)
    emotional_profile = EmotionalProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'bio', 'location',
            'birth_date', 'avatar', 'stats', 'emotional_profile'
        )
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        print(f"Creating user with data: {validated_data.keys()}")
        try:
            user = User.objects.create_user(**validated_data)
            UserStats.objects.get_or_create(user=user)
            EmotionalProfile.objects.get_or_create(user=user)
            print("User created successfully")
            return user
        except Exception as e:
            print(f"Error creating user: {e}")
            raise serializers.ValidationError(str(e))

class EmotionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionRecord
        fields = '__all__'
        read_only_fields = ('user', 'timestamp')

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at', 'sentiment_score', 'detected_mood')

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = '__all__'
