from django.contrib import admin
from .models import ChatSession, Experiment, DailyLog


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'created_at', 'updated_at']
    search_fields = ['user__email', 'title']
    list_filter = ['created_at']


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ['user', 'metric', 'status', 'start_date', 'duration_days']
    list_filter = ['status']
    search_fields = ['user__email', 'hypothesis', 'metric']


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ['experiment', 'date', 'completed', 'metric_value']
    list_filter = ['completed', 'date']
