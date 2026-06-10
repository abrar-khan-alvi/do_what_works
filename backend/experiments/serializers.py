from rest_framework import serializers
from .models import ChatSession, Experiment, DailyLog, DailyCheckin


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Serializer for session list including message JSON history."""
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'messages', 'created_at', 'updated_at']


class ChatSessionDetailSerializer(serializers.ModelSerializer):
    """Full serializer with message JSON history."""
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = ['id', 'date', 'completed', 'metric_value', 'logged_metrics', 'notes', 'daily_observation', 'ai_suggestion', 'created_at']
        read_only_fields = ['id', 'created_at', 'ai_suggestion']


class ExperimentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for experiment list."""
    logs_count = serializers.IntegerField(source='logs.count', read_only=True)

    class Meta:
        model = Experiment
        fields = ['id', 'hypothesis', 'action', 'metric', 'duration_days',
                  'start_date', 'status', 'metrics_config', 'logs_count', 'created_at']
        read_only_fields = ['id', 'start_date', 'created_at']


class ExperimentDetailSerializer(serializers.ModelSerializer):
    """Full serializer with nested logs."""
    logs = DailyLogSerializer(many=True, read_only=True)

    class Meta:
        model = Experiment
        fields = ['id', 'hypothesis', 'action', 'metric', 'duration_days',
                  'start_date', 'status', 'metrics_config', 'logs', 'ai_analysis', 'created_at', 'updated_at']
        read_only_fields = ['id', 'start_date', 'created_at', 'updated_at']


class ExperimentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = ['hypothesis', 'action', 'metric', 'duration_days', 'metrics_config']


class ExperimentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = ['status']


class DailyCheckinSerializer(serializers.ModelSerializer):
    focus = serializers.IntegerField(min_value=1, max_value=10)
    energy = serializers.IntegerField(min_value=1, max_value=10)
    mood = serializers.IntegerField(min_value=1, max_value=10)
    stress = serializers.IntegerField(min_value=1, max_value=10)
    social = serializers.IntegerField(min_value=1, max_value=10)
    progress = serializers.IntegerField(min_value=1, max_value=10)
    sleep = serializers.IntegerField(min_value=1, max_value=10)
    exercise = serializers.IntegerField(min_value=1, max_value=10)

    class Meta:
        model = DailyCheckin
        fields = [
            'id', 'date', 'day_of_week',
            'focus', 'energy', 'mood', 'stress',
            'social', 'progress', 'sleep', 'exercise',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'date', 'day_of_week', 'created_at']

