export type BusinessSubscription = {
    id: number | null;
    name: string;
    subscription_plan: string;
    subscription_status: string;
    effective_status: string;
    trial_started_at: string | null;
    trial_ends_at: string | null;
    max_employees: number | null;
    subscription_started_at: string | null;
    subscription_ends_at: string | null;
};

type SubscriptionResult =
    | { ok: true; data: BusinessSubscription }
    | { ok: false; status: number; message: string };

export async function getSubscriptionStatus(
    apiBaseUrl: string,
    token: string | null
): Promise<SubscriptionResult> {
    if (!token) {
        return {
            ok: false,
            status: 401,
            message: "Missing token",
        };
    }

    try {
        const res = await fetch(`${apiBaseUrl}/api/business/subscription-status`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                message: data.message || "Failed to load subscription status",
            };
        }

        return {
            ok: true,
            data,
        };
    } catch (err) {
        console.error("Get subscription status error:", err);
        return {
            ok: false,
            status: 500,
            message: "Something went wrong while loading subscription status",
        };
    }
}