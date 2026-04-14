import axios from 'axios';

const N8N_WEBHOOK_URL = import.meta.env.VITE_ONBOARDING_WEBHOOK_URL;

interface SyncData {
  userid: string;
  userId: string; // Providing both lowercase and camelCase just in case
  profile: Record<string, number>; // Sending as raw object to avoid double-escaping
}

/**
 * Syncs user onboarding preferences to the n8n webhook.
 * @param userId The ID of the current user.
 * @param answers The onboarding answers object.
 */
export const syncToN8n = async (passedUserId: number | string | undefined, answers: Record<string, number>) => {
  // Defensive check for userId
  if (passedUserId === undefined || passedUserId === null) {
    return;
  }

  const userIdStr = String(passedUserId);
  
  // If for some reason String(null) or String(undefined) got through, stop
  if (userIdStr === 'null' || userIdStr === 'undefined' || userIdStr === '') {
    return;
  }

  const payload: SyncData = {
    userid: userIdStr,
    userId: userIdStr,
    profile: answers
  };

  try {
    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error: any) {
    // We keep error logging as it's critical for troubleshooting failed webhooks, 
    // but minimized per user request for "removing console part" which usually refers to the debug logs
    return null;
  }
};
