from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Experiment

@receiver(post_save, sender=Experiment)
def handle_experiment_succession(sender, instance, created, **kwargs):
    """
    Auto-succession logic: When an experiment is marked as 'completed' or 'abandoned',
    automatically activate the next 'queued' experiment for the user.
    """
    # We only care if the status JUST changed to a terminal state
    # (completed or abandoned) and there is no active experiment left.
    if instance.status in ['completed', 'abandoned']:
        user = instance.user
        
        # Check if the user already has an active experiment (sanity check)
        # We don't want to activate a second one if one was somehow already active.
        has_active = Experiment.objects.filter(user=user, status='active').exists()
        
        if not has_active:
            # Find the oldest queued experiment
            next_queued = Experiment.objects.filter(
                user=user, status='queued'
            ).order_by('created_at').first()
            
            if next_queued:
                # Update status and start_date
                next_queued.status = 'active'
                next_queued.start_date = timezone.now().date()
                next_queued.save()
