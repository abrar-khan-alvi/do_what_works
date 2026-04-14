from django.urls import path
from . import views

urlpatterns = [
    # Chat
    path('chat/sessions/', views.ChatSessionListCreateView.as_view(), name='chat-sessions'),
    path('chat/sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('chat/sessions/<int:pk>/messages/', views.ChatMessageListCreateView.as_view(), name='chat-messages'),

    # Experiments
    path('experiments/', views.ExperimentListCreateView.as_view(), name='experiments'),
    path('experiments/<int:pk>/', views.ExperimentDetailView.as_view(), name='experiment-detail'),
    path('experiments/<int:pk>/logs/', views.DailyLogView.as_view(), name='experiment-logs'),
    path('experiments/<int:pk>/analyze/', views.ExperimentAnalyzeView.as_view(), name='experiment-analyze'),
]
