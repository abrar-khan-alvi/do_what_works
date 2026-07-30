import os
import requests


def trigger_onboarding_sync(user, answers, scores=None):
    """
    Server-side replacement for the old browser -> n8n direct call
    (previously frontend/src/services/n8nSync.ts, called from Onboarding.tsx,
    Overview.tsx and Preferences.tsx). Fires as a side effect of
    OnboardingView.post() whenever belief answers and/or attention-battery
    scores are saved, keeping the webhook URL out of any client bundle.
    """
    webhook_url = os.getenv('ONBOARDING_WEBHOOK_URL')
    if not webhook_url or 'placeholder' in webhook_url:
        print("DEBUG: ONBOARDING_WEBHOOK_URL not configured.")
        return None

    profile = dict(answers or {})
    if scores:
        profile.update(scores)

    payload = {
        "userid": str(user.id),
        "userId": str(user.id),
        "profile": profile,
    }
    if scores:
        payload["attention_scores"] = scores

    try:
        response = requests.post(webhook_url, json=payload, timeout=15)
        response.raise_for_status()
        return response.json() if response.content else None
    except Exception as e:
        print(f"DEBUG: Error during Onboarding sync webhook call: {str(e)}")
        return None
