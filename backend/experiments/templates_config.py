# Preset templates configuration for Experiments

EXPERIMENT_TEMPLATES = [
    # --- 10 CORE TESTS ---
    {
        "id": "no_social_after_8pm",
        "title": "No Social Media After 8PM",
        "category": "Discipline",
        "duration_days": 7,
        "hypothesis": "If I remove social media after 8 PM, then my sleep quality and morning clarity will improve.",
        "action": "Do not open any social media apps after 8:00 PM.",
        "metrics": [
            {"id": "sleep_quality", "label": "Sleep Quality (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "morning_clarity", "label": "Morning Clarity (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "screen_time_night", "label": "Avoided Night Social Media?", "type": "boolean", "default": False}
        ]
    },
    {
        "id": "wake_up_same_time",
        "title": "Wake Up Same Time Daily",
        "category": "Discipline",
        "duration_days": 7,
        "hypothesis": "If I wake up at the exact same time every day, then my biological rhythm and energy levels will stabilize.",
        "action": "Set an alarm and get out of bed at the exact same time, regardless of sleep duration.",
        "metrics": [
            {"id": "wake_on_time", "label": "Woke up at scheduled time?", "type": "boolean", "default": False},
            {"id": "energy", "label": "Daily Energy (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "mood", "label": "Daily Mood (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "phone_outside_bedroom",
        "title": "Phone Outside Bedroom",
        "category": "Attention",
        "duration_days": 7,
        "hypothesis": "If I leave my phone outside my bedroom overnight, then I will reduce bedtime impulse use and improve sleep quality.",
        "action": "Charge your phone outside the bedroom overnight. Do not bring it in.",
        "metrics": [
            {"id": "phone_outside", "label": "Phone left outside bedroom?", "type": "boolean", "default": False},
            {"id": "sleep_quality", "label": "Sleep Quality (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "morning_urge", "label": "Urge level to check phone in morning (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "deep_work_90",
        "title": "90-Minute Deep Work Block",
        "category": "Execution",
        "duration_days": 5,
        "hypothesis": "If I dedicate one uninterrupted 90-minute block to my most important task daily, then my focus capacity will build up.",
        "action": "Do 90 minutes of work with zero notifications, zero tabs unrelated to the task, and zero phone usage.",
        "metrics": [
            {"id": "completed_block", "label": "Completed 90-minute block?", "type": "boolean", "default": False},
            {"id": "interruptions", "label": "Number of interruptions", "type": "integer", "default": 0},
            {"id": "focus_rating", "label": "Focus rating (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "steps_10k",
        "title": "10,000 Steps Daily",
        "category": "Energy",
        "duration_days": 7,
        "hypothesis": "If I walk 10,000 steps daily, then my baseline physical energy and mood will improve.",
        "action": "Walk or run until step count hits 10,000.",
        "metrics": [
            {"id": "steps", "label": "Total steps walked", "type": "integer", "default": 0},
            {"id": "energy", "label": "Baseline Energy (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "mood", "label": "Mood (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "protein_first_diet",
        "title": "Protein-First Diet",
        "category": "Energy",
        "duration_days": 7,
        "hypothesis": "If I eat protein first in every meal, then my energy levels will stabilize and I will reduce sugar crashes.",
        "action": "Eat the protein source on your plate before any carbohydrates or fats in every meal.",
        "metrics": [
            {"id": "protein_first", "label": "Ate protein first in all meals?", "type": "boolean", "default": False},
            {"id": "afternoon_energy", "label": "Afternoon Energy (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "hunger_swings", "label": "Hunger Swings / Cravings (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "meditation_10",
        "title": "10-Minute Meditation",
        "category": "Attention",
        "duration_days": 7,
        "hypothesis": "If I practice mindfulness meditation for 10 minutes daily, then I will improve internal regulation and stress resilience.",
        "action": "Sit in silence and observe your breath for 10 minutes using a timer.",
        "metrics": [
            {"id": "completed", "label": "Completed meditation?", "type": "boolean", "default": False},
            {"id": "calmness", "label": "Calmness rating (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "focus", "label": "Focus rating (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "no_complaining",
        "title": "No Complaining",
        "category": "Discipline",
        "duration_days": 5,
        "hypothesis": "If I avoid expressing verbal complaints for 5 days, then my mental patterns and mood will shift positively.",
        "action": "Do not complain verbally. If you catch yourself complaining, note it as a violation.",
        "metrics": [
            {"id": "violations", "label": "Number of complaints / violations", "type": "integer", "default": 0},
            {"id": "awareness", "label": "Awareness level when catching complaints (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "mood", "label": "Mood (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "real_interaction_daily",
        "title": "1 Real Interaction Daily",
        "category": "Social",
        "duration_days": 7,
        "hypothesis": "If I initiate at least one real, non-transactional conversation daily, then my social baseline will improve.",
        "action": "Have at least one face-to-face or phone conversation that is not purely about buying something or work chores.",
        "metrics": [
            {"id": "completed", "label": "Had real interaction?", "type": "boolean", "default": False},
            {"id": "comfort_level", "label": "Comfort level during interaction (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "energy_after", "label": "Energy level after interaction (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "physical_training_daily",
        "title": "Daily Physical Training",
        "category": "Discipline",
        "duration_days": 5,
        "hypothesis": "If I engage in physical training daily, then my discipline and physical activation will increase.",
        "action": "Perform a minimum of 20 minutes of physical training or active movement.",
        "metrics": [
            {"id": "completed", "label": "Completed 20-min workout?", "type": "boolean", "default": False},
            {"id": "intensity", "label": "Workout intensity (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "energy_after", "label": "Energy after training (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },

    # --- 7 SOCIAL EXPOSURE LEVELS ---
    {
        "id": "social_level1_micro",
        "title": "3 Micro Interactions Daily",
        "category": "Social",
        "duration_days": 5,
        "hypothesis": "If I say something to 3 people daily, then I will start breaking my avoidance habits.",
        "action": "Initiate brief exchanges with 3 service workers or strangers (e.g. barista, cashier, gym member).",
        "metrics": [
            {"id": "completed", "label": "Interacted with 3 people?", "type": "boolean", "default": False},
            {"id": "anxiety_before", "label": "Anxiety before (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "energy_after", "label": "Energy after (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "social_level1_compliment",
        "title": "Give 1 Genuine Compliment Daily",
        "category": "Social",
        "duration_days": 5,
        "hypothesis": "If I give one genuine compliment to a stranger daily, then my mindset and connection comfort will improve.",
        "action": "Give a specific, non-creepy, genuine compliment to someone you don't know.",
        "metrics": [
            {"id": "completed", "label": "Gave a genuine compliment?", "type": "boolean", "default": False},
            {"id": "feeling", "label": "Internal feeling afterward (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "mood", "label": "General daily mood (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "social_level1_outbound",
        "title": "10 Messages Outbound",
        "category": "Social",
        "duration_days": 5,
        "hypothesis": "If I send 10 outbound messages daily, then I will increase my social pipeline and connection opportunities.",
        "action": "Send 10 texts, DMs, or replies to friends, acquaintances, or matches.",
        "metrics": [
            {"id": "sent_count", "label": "Number of messages sent (max 10)", "type": "integer", "default": 0},
            {"id": "replies_count", "label": "Number of replies received", "type": "integer", "default": 0},
            {"id": "chats_started", "label": "New conversations started", "type": "integer", "default": 0}
        ]
    },
    {
        "id": "social_level2_extend",
        "title": "Extend One Conversation",
        "category": "Social",
        "duration_days": 5,
        "hypothesis": "If I take one interaction beyond surface level daily, then I will build greater conversational depth.",
        "action": "Ask a follow-up question or make a personal comment to stretch a routine conversation.",
        "metrics": [
            {"id": "completed", "label": "Extended a conversation?", "type": "boolean", "default": False},
            {"id": "comfort", "label": "Comfort level (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "quality", "label": "Conversation depth quality (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "social_level2_no_phone",
        "title": "No Phone in Social Settings",
        "category": "Social",
        "duration_days": 5,
        "hypothesis": "If I keep my phone stored away during social settings, then I will increase my presence and social engagement.",
        "action": "Keep your phone entirely in your pocket/bag and do not check it when around other people.",
        "metrics": [
            {"id": "completed", "label": "Zero phone checks in social settings?", "type": "boolean", "default": False},
            {"id": "awareness", "label": "Presence awareness level (1-10)", "type": "rating_1_10", "default": 5},
            {"id": "interaction_quality", "label": "Quality of face-to-face interactions (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "social_level3_alone",
        "title": "Go Out Alone Once",
        "category": "Social",
        "duration_days": 7,
        "hypothesis": "If I go to a social environment completely alone once, then I will build independence and break social anxiety habits.",
        "action": "Spend at least 45 minutes alone at a cafe, bar, library, or event without relying on your phone.",
        "metrics": [
            {"id": "time_spent", "label": "Minutes spent alone", "type": "integer", "default": 0},
            {"id": "interactions", "label": "Number of brief interactions had", "type": "integer", "default": 0},
            {"id": "comfort_level", "label": "Comfort level (1-10)", "type": "rating_1_10", "default": 5}
        ]
    },
    {
        "id": "social_level3_initiate",
        "title": "Initiate One Plan",
        "category": "Social",
        "duration_days": 5,
        "hypothesis": "If I invite someone to hang out, then I will transition from passive social habits to active initiative.",
        "action": "Invite a friend, colleague, or contact to do something specific (e.g. coffee, lunch, gym).",
        "metrics": [
            {"id": "attempted", "label": "Invited someone?", "type": "boolean", "default": False},
            {"id": "accepted", "label": "Was invitation accepted?", "type": "boolean", "default": False},
            {"id": "response_comfort", "label": "Emotional comfort with initiating (1-10)", "type": "rating_1_10", "default": 5}
        ]
    }
]
