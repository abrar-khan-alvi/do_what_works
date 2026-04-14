from rest_framework import serializers
from .models import ChatSession, Experiment, DailyLog


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
        fields = ['id', 'date', 'completed', 'metric_value', 'notes', 'daily_observation', 'created_at']
        read_only_fields = ['id', 'created_at']


class ExperimentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for experiment list."""
    logs_count = serializers.IntegerField(source='logs.count', read_only=True)

    class Meta:
        model = Experiment
        fields = ['id', 'hypothesis', 'action', 'metric', 'duration_days',
                  'start_date', 'status', 'logs_count', 'created_at']
        read_only_fields = ['id', 'start_date', 'created_at']


class ExperimentDetailSerializer(serializers.ModelSerializer):
    """Full serializer with nested logs."""
    logs = DailyLogSerializer(many=True, read_only=True)

    class Meta:
        model = Experiment
        fields = ['id', 'hypothesis', 'action', 'metric', 'duration_days',
                  'start_date', 'status', 'logs', 'ai_analysis', 'created_at', 'updated_at']
        read_only_fields = ['id', 'start_date', 'created_at', 'updated_at']


class ExperimentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = ['hypothesis', 'action', 'metric', 'duration_days']


class ExperimentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = ['status']
