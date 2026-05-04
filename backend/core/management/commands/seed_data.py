from django.core.management.base import BaseCommand
from core.models import Recommendation

class Command(BaseCommand):
    help = 'Seeds initial recommendations'

    def handle(self, *args, **options):
        recs = [
            # Happy
            {'category': 'Music', 'emotion_target': 'Happy', 'title': 'Uplifting Beats', 'content': 'Listen to "Walking on Sunshine" - Katrina & The Waves'},
            {'category': 'Exercise', 'emotion_target': 'Happy', 'title': 'High Energy Run', 'content': 'You have great energy! A 20-minute jog will make it even better.'},
            {'category': 'Quote', 'emotion_target': 'Happy', 'title': 'On Joy', 'content': 'Happiness is not something ready made. It comes from your own actions.'},
            
            # Sad
            {'category': 'Music', 'emotion_target': 'Sad', 'title': 'Comforting Melodies', 'content': 'Listen to "Weightless" by Marconi Union for deep relaxation.'},
            {'category': 'Meditation', 'emotion_target': 'Sad', 'title': 'Self-Compassion', 'content': 'Try a 5-minute guided breathing exercise focusing on self-love.'},
            {'category': 'Quote', 'emotion_target': 'Sad', 'title': 'Persistence', 'content': 'The sun will rise and we will try again.'},
            
            # Angry
            {'category': 'Exercise', 'emotion_target': 'Angry', 'title': 'Release Tension', 'content': 'Try some shadow boxing or high-intensity interval training.'},
            {'category': 'Meditation', 'emotion_target': 'Angry', 'title': 'Cooling Breath', 'content': 'Sitali breath: Inhale through curled tongue, exhale through nose.'},
            {'category': 'Quote', 'emotion_target': 'Angry', 'title': 'Patience', 'content': 'For every minute you are angry, you lose sixty seconds of happiness.'},
            
            # Neutral
            {'category': 'Meditation', 'emotion_target': 'Neutral', 'title': 'Mindfulness', 'content': 'Focus on your surroundings. Name 5 things you can see.'},
            {'category': 'Music', 'emotion_target': 'Neutral', 'title': 'Focus Lofi', 'content': 'Perfect time for some deep work with Lofi Girl on YouTube.'},
            {'category': 'Exercise', 'emotion_target': 'Neutral', 'title': 'Stretching', 'content': 'A quick 5-minute full body stretch to keep the blood flowing.'},
        ]

        for rec in recs:
            Recommendation.objects.get_or_create(**rec)
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded recommendations'))
