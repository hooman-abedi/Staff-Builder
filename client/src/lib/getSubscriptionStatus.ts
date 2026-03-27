export type SubscriptionStatusResponse = {
    id: number;
    name: string;
    subscription_plan: string;
    subscription_status: string;
    effective_status: string;
    trial_started_at: string | null;
    trial_ends_at: string | null;
    max_employees: number;
    subscription_started_at: string | null;
    subscription_ends_at: string | null;
};

export async function getSubscriptionStatus(
    apiBaseUrl: string,
    token: string
): Promise<SubscriptionStatusResponse> {
    const res = await fetch(`${apiBaseUrl}/api/business/subscription-status`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to load subscription status");
    }

    return data as SubscriptionStatusResponse;
}