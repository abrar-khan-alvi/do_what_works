from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import ChatSession, Experiment, DailyLog
from .serializers import (
    ChatSessionListSerializer,
    ChatSessionDetailSerializer,
    DailyLogSerializer,
    ExperimentListSerializer,
    ExperimentDetailSerializer,
    ExperimentCreateSerializer,
    ExperimentStatusSerializer,
)


# ─────────────────────────────────────────────
#  Chat
# ─────────────────────────────────────────────

class ChatSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        # For the list, we keep it lightweight
        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        session = ChatSession.objects.create(
            user=request.user,
            title=request.data.get('title', 'New Conversation'),
            messages=[]
        )
        serializer = ChatSessionDetailSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_session(self, pk, user):
        try:
            return ChatSession.objects.get(pk=pk, user=user)
        except ChatSession.DoesNotExist:
            return None

    def get(self, request, pk):
        session = self._get_session(pk, request.user)
        if not session:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ChatSessionDetailSerializer(session)
        return Response(serializer.data)

    def patch(self, request, pk):
        from django.db import transaction
        
        try:
            with transaction.atomic():
                session = ChatSession.objects.select_for_update().get(pk=pk, user=request.user)
                
                # Can update title or messages
                title = request.data.get('title', '').strip()
                if title:
                    session.title = title[:100]
                
                messages = request.data.get('messages')
                if messages is not None:
                    session.messages = messages
                
                session.save()
                return Response(ChatSessionDetailSerializer(session).data)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        session = self._get_session(pk, request.user)
        if not session:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChatMessageListCreateView(APIView):
    """
    Refactored to append to the messages JSON field of the parent session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from django.db import transaction
        
        # Use atomic transaction to ensure safe list append
        try:
            with transaction.atomic():
                # select_for_update helps prevent race conditions on the JSON field
                session = ChatSession.objects.select_for_update().get(pk=pk, user=request.user)
                
                # Generate a high-precision ID and ISO 8601 timestamp
                now = timezone.now()
                new_message = {
                    "id": f"msg_{now.strftime('%Y%m%d%H%M%S%f')}",
                    "sender": request.data.get('sender'),
                    "text": request.data.get('text'),
                    "is_proposal": bool(request.data.get('is_proposal', False)),
                    "proposal_data": request.data.get('proposal_data', {}),
                    "timestamp": now.isoformat()
                }

                # Thread-safe message list update
                current_messages = list(session.messages) if session.messages else []
                current_messages.append(new_message)
                session.messages = current_messages
                session.save()
                
                return Response(new_message, status=status.HTTP_201_CREATED)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Catch other potential errors (like SQLite locking issues)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ─────────────────────────────────────────────
#  Experiments
# ─────────────────────────────────────────────

class ExperimentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        experiments = Experiment.objects.filter(user=request.user)
        serializer = ExperimentDetailSerializer(experiments, many=True)
        return Response(serializer.data)

    def post(self, request):
        from django.db import transaction
        serializer = ExperimentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                # On SQLite, atomic is enough for serializable checks
                # Check for active experiment
                has_active = Experiment.objects.filter(
                    user=request.user, status='active'
                ).exists()
                
                # Determine initial status
                status_val = 'active' if not has_active else 'queued'
                print(f"DEBUG: ASSIGNING STATUS: {status_val}")
                
                experiment = serializer.save(user=request.user, status=status_val)
                
                return Response(
                    ExperimentDetailSerializer(experiment).data,
                    status=status.HTTP_201_CREATED
                )
        except Exception as e:
            print(f"DEBUG: EXCEPTION DURING SAVE: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ExperimentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_experiment(self, pk, user):
        try:
            return Experiment.objects.get(pk=pk, user=user)
        except Experiment.DoesNotExist:
            return None

    def get(self, request, pk):
        experiment = self._get_experiment(pk, request.user)
        if not experiment:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ExperimentDetailSerializer(experiment).data)

    def patch(self, request, pk):
        """Used for status changes: active → abandoned/completed, or restore."""
        experiment = self._get_experiment(pk, request.user)
        if not experiment:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['active', 'completed', 'abandoned', 'queued']:
            return Response(
                {'error': 'Invalid status.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restoring/Starting an experiment as 'active'
        if new_status == 'active':
            # Check if another experiment is already active
            active_exists = Experiment.objects.filter(
                user=request.user, status='active'
            ).exclude(pk=pk).exists()
            
            if active_exists:
                return Response(
                    {'error': 'You already have an active experiment. Complete or abandon it before starting another.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        experiment.status = new_status
        experiment.save()
        return Response(ExperimentDetailSerializer(experiment).data)

    def delete(self, request, pk):
        experiment = self._get_experiment(pk, request.user)
        if not experiment:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        experiment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DailyLogView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_experiment(self, pk, user):
        try:
            return Experiment.objects.get(pk=pk, user=user)
        except Experiment.DoesNotExist:
            return None

    def get(self, request, pk):
        experiment = self._get_experiment(pk, request.user)
        if not experiment:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        logs = experiment.logs.all()
        return Response(DailyLogSerializer(logs, many=True).data)

    def post(self, request, pk):
        """Create or update today's log entry (upsert by date)."""
        experiment = self._get_experiment(pk, request.user)
        if not experiment:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()
        serializer = DailyLogSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        log, created = DailyLog.objects.update_or_create(
            experiment=experiment,
            date=today,
            defaults={
                'completed': serializer.validated_data['completed'],
                'metric_value': serializer.validated_data.get('metric_value', 5),
                'notes': serializer.validated_data.get('notes', ''),
                'daily_observation': serializer.validated_data.get('daily_observation', ''),
            }
        )

        # Auto-complete if all days logged
        total_logs = experiment.logs.count()
        if total_logs >= experiment.duration_days:
            experiment.status = 'completed'
            experiment.save()
        return Response(
            DailyLogSerializer(log).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
