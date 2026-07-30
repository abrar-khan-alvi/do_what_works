from django.urls import path
from . import views

urlpatterns = [
    # Chat
    path('chat/sessions/', views.ChatSessionListCreateView.as_view(), name='chat-sessions'),
    path('chat/sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('chat/sessions/<int:pk>/messages/', views.ChatMessageListCreateView.as_view(), name='chat-messages'),
    path('chat/sessions/<int:pk>/ask/', views.ChatAskDanielView.as_view(), name='chat-ask-daniel'),

    # Experiments
    path('experiments/templates/', views.ExperimentTemplatesView.as_view(), name='experiment-templates'),
    path('experiments/', views.ExperimentListCreateView.as_view(), name='experiments'),
    path('experiments/<int:pk>/', views.ExperimentDetailView.as_view(), name='experiment-detail'),
    path('experiments/<int:pk>/logs/', views.DailyLogView.as_view(), name='experiment-logs'),
    path('experiments/<int:pk>/analyze/', views.ExperimentAnalyzeView.as_view(), name='experiment-analyze'),
    path('experiments/<int:pk>/generate-daily-action/', views.ExperimentDailyActionView.as_view(), name='experiment-daily-action'),
    path('experiments/daily-checkin/', views.DailyCheckinView.as_view(), name='daily-checkin'),
]
