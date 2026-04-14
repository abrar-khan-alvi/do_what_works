import requests
from django.conf import settings
import os

def trigger_ai_analysis(experiment):
    """
    Sends experiment data to the n8n webhook for AI analysis.
    The response should be a JSON object with:
    - pragmatic_score
    - verdict
    - analysis
    - recommendation
    """
    webhook_url = os.getenv('ANALYSIS_WEBHOOK_URL')
    if not webhook_url or 'placeholder' in webhook_url:
        print("DEBUG: ANALYSIS_WEBHOOK_URL not configured.")
        return None

    # Prepare payload based on the user's requirements
    payload = {
        "userId": str(experiment.user.id),
        "experiment_id": str(experiment.id),
        "hypothesis": experiment.hypothesis,
        "action": experiment.action,
        "metric": experiment.metric,
        "duration": experiment.duration_days,
        "logs": [
            {
                "date": log.date.isoformat(),
                "completed": log.completed,
                "score": log.metric_value,
                "notes": log.notes,
                "observation": log.daily_observation
            }
            for log in experiment.logs.all().order_by('date')
        ]
    }

    print(f"DEBUG: Triggering analysis for exp {experiment.id} at {webhook_url}")
    try:
        response = requests.post(webhook_url, json=payload, timeout=30)
        print(f"DEBUG: Webhook response status: {response.status_code}")
        response.raise_for_status()
        
        raw_data = response.json()
        
        # Handle n8n's specific output format: [{ "output": "{...}" }]
        analysis_data = {}
        if isinstance(raw_data, list) and len(raw_data) > 0:
            item = raw_data[0]
            if 'output' in item:
                import json
                try:
                    analysis_data = json.loads(item['output'])
                except Exception as je:
                    print(f"DEBUG: JSON parsing failed for 'output': {je}")
            else:
                analysis_data = item
        else:
            analysis_data = raw_data
        
        if 'pragmatic_score' in analysis_data:
            experiment.ai_analysis = analysis_data
            experiment.save(update_fields=['ai_analysis'])
            
            # Create a notification for the user
            try:
                from accounts.models import Notification
                Notification.objects.create(
                    user=experiment.user,
                    title="Strategist Insight Ready",
                    message=f"Daniel has finished the analysis for your protocol: \"{experiment.hypothesis[:50]}...\". New recommendations available.",
                    notif_type='ai_analysis_ready',
                    link=f"/result/{experiment.id}"
                )
            except Exception as ne:
                print(f"DEBUG: Failed to create analysis notification: {ne}")

            return analysis_data
        else:
            print(f"DEBUG: Webhook response missing 'pragmatic_score' key. Data received: {analysis_data}")
        
        return None
    except Exception as e:
        print(f"DEBUG: Error during AI Analysis webhook call: {str(e)}")
        return None
