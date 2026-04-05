from django.db import models
from accounts.models import CustomUser


class ChatSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=200, default='New Conversation')
    messages = models.JSONField(default=list)  # Stores list of message objects
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.user.username}: {self.title}'


# ChatMessage model removed in favor of JSONField in ChatSession



class Experiment(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('queued', 'Queued'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='experiments')
    hypothesis = models.TextField()
    action = models.TextField()
    metric = models.CharField(max_length=100)
    duration_days = models.PositiveIntegerField()
    start_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username}: {self.hypothesis[:50]}'


class DailyLog(models.Model):
    COMPLETED_CHOICES = [('yes', 'Yes'), ('no', 'No')]

    experiment = models.ForeignKey(
        Experiment, on_delete=models.CASCADE, related_name='logs'
    )
    date = models.DateField()
    completed = models.CharField(max_length=3, choices=COMPLETED_CHOICES)
    metric_value = models.PositiveSmallIntegerField(default=5)  # 1-10
    notes = models.TextField(blank=True)
    daily_observation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('experiment', 'date')
        ordering = ['date']

    def __str__(self):
        return f'Log for experiment {self.experiment_id} on {self.date}'
