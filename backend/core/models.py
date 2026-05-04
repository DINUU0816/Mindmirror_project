from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    def __str__(self):
        return self.username

class EmotionRecord(models.Model):
    EMOTION_CHOICES = [
        ('Happy', 'Happy'),
        ('Sad', 'Sad'),
        ('Angry', 'Angry'),
        ('Neutral', 'Neutral'),
        ('Surprise', 'Surprise'),
        ('Fear', 'Fear'),
        ('Disgust', 'Disgust'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emotions')
    emotion = models.CharField(max_length=20, choices=EMOTION_CHOICES)
    confidence = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)
    note = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journals')
    title = models.CharField(max_length=200)
    content = models.TextField()
    sentiment_score = models.FloatField(default=0.0)
    detected_mood = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

class Recommendation(models.Model):
    REC_TYPES = [
        ('Music', 'Music'),
        ('Meditation', 'Meditation'),
        ('Quote', 'Quote'),
        ('Exercise', 'Exercise'),
    ]
    category = models.CharField(max_length=20, choices=REC_TYPES)
    emotion_target = models.CharField(max_length=20) # Which emotion triggers this
    title = models.CharField(max_length=200)
    content = models.TextField() # Could be a link or text
    link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"[{self.category}] {self.title} for {self.emotion_target}"

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_checkins = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    last_checkin = models.DateField(null=True, blank=True)
    emotional_health_score = models.FloatField(default=100.0)

    def __str__(self):
        return f"{self.user.username} Stats"
