import posthog from 'posthog-js'

const POSTHOG_TOKEN = import.meta.env.VITE_POSTHOG_TOKEN;

if (!POSTHOG_TOKEN) {
    console.error('POSTHOG_TOKEN is not set')
} else {
    posthog.init(POSTHOG_TOKEN,
        {
            api_host: 'https://us.i.posthog.com',
            person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
        }
    )
}

export const AnalyticsEvents = {
    DECKLIST_SUBMITTED: 'Decklist Submitted',
} as const;

export const captureEvent = (event: string, value?: string) => {
    posthog.capture(event, { property: value })
}

