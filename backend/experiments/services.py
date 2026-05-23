import requests
from django.conf import settings
import os

def get_cognitive_history(user):
    from accounts.models import CognitiveBaselineLog, UserOnboarding
    logs = CognitiveBaselineLog.objects.filter(user=user).order_by('-created_at')[:10]
    logs = list(reversed(logs))
    
    cognitive_history = [
        {
            "date": log.created_at.isoformat(),
            "attention_score": log.attention_score,
            "capacity_score": log.capacity_score,
            "control_score": log.control_score,
            "endurance_score": log.endurance_score
        }
        for log in logs
    ]
    
    # Fallback to UserOnboarding if history is empty
    if not cognitive_history:
        try:
            onb = UserOnboarding.objects.get(user=user)
            if onb.attention_score is not None:
                cognitive_history = [{
                    "date": onb.completed_at.isoformat() if onb.completed_at else user.created_at.isoformat(),
                    "attention_score": onb.attention_score,
                    "capacity_score": onb.capacity_score or 3,
                    "control_score": onb.control_score or 0.0,
                    "endurance_score": onb.endurance_score or 0.0
                }]
        except Exception:
            pass
            
    return cognitive_history

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
        "metrics_config": experiment.metrics_config,
        "cognitive_history": get_cognitive_history(experiment.user),
        "logs": [
            {
                "date": log.date.isoformat(),
                "completed": log.completed,
                "score": log.metric_value,
                "logged_metrics": log.logged_metrics,
                "notes": log.notes,
                "observation": log.daily_observation,
                "ai_suggestion": log.ai_suggestion
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

def trigger_daily_action(experiment, log):
    """
    Sends the entire experiment history to n8n to generate a specific action for today.
    """
    webhook_url = os.getenv('DAILY_ACTION_WEBHOOK_URL')
    if not webhook_url or 'placeholder' in webhook_url:
        # Fallback to the one provided by user if env not set
        webhook_url = "https://thepragmatist.app.n8n.cloud/webhook/action"

    payload = {
        "userId": str(experiment.user.id),
        "experiment_id": str(experiment.id),
        "hypothesis": experiment.hypothesis,
        "original_action": experiment.action,
        "metric": experiment.metric,
        "duration": experiment.duration_days,
        "day_number": experiment.logs.count(),
        "metrics_config": experiment.metrics_config,
        "cognitive_history": get_cognitive_history(experiment.user),
        "logs": [
            {
                "date": l.date.isoformat(),
                "completed": l.completed,
                "score": l.metric_value,
                "logged_metrics": l.logged_metrics,
                "notes": l.notes,
                "observation": l.daily_observation,
                "previous_suggestion": l.ai_suggestion
            }
            for l in experiment.logs.all().order_by('date')
        ]
    }

    try:
        response = requests.post(webhook_url, json=payload, timeout=30)
        response.raise_for_status()
        raw_data = response.json()
        
        # Handle n8n output format
        suggestion = ""
        if isinstance(raw_data, list) and len(raw_data) > 0:
            item = raw_data[0]
            # Try to find 'action' or 'suggestion' or 'output'
            suggestion = item.get('action') or item.get('suggestion') or item.get('output', '')
        else:
            suggestion = raw_data.get('action') or raw_data.get('suggestion', '')

        if suggestion:
            # Handle case where AI returns JSON wrapped in markdown
            if "```json" in suggestion or suggestion.strip().startswith('{'):
                try:
                    import json, re
                    clean_json = suggestion
                    if "```json" in suggestion:
                        match = re.search(r'```json\s*(.*?)\s*```', suggestion, re.DOTALL)
                        if match:
                            clean_json = match.group(1)
                    
                    parsed = json.loads(clean_json)
                    if isinstance(parsed, dict):
                        suggestion = parsed.get('todays_action') or parsed.get('action') or parsed.get('suggestion') or suggestion
                except Exception as pe:
                    print(f"DEBUG: Failed to parse suggestion JSON: {pe}")

            log.ai_suggestion = suggestion
            log.save(update_fields=['ai_suggestion'])
            return suggestion
        return None
    except Exception as e:
        print(f"DEBUG: Error during Daily Action webhook call: {str(e)}")
        return None
