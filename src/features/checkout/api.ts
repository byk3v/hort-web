import { api } from "@/src/lib/axios";
import {CheckoutCollectorInfo, CheckoutSearchResponse} from "@/src/types/CheckoutSearchResponse";

export async function searchStudentForCheckout(q: string) {
    const { data } = await api.get<CheckoutSearchResponse>("/checkout/search", {
        params: { q },
    });
    return data;
}

export async function confirmCheckoutWithCollector(
    studentId: number,
    collector: CheckoutCollectorInfo
) {
    await api.post("/checkout/confirm", {
        studentId,
        collectorId: collector.collectorId,
        pickupRightId: collector.pickupRightId,
        selfDismissal: false,
        comment: null,
    });
}

export async function confirmSelfDismissal(
    studentId: number
) {
    await api.post("/checkout/confirm", {
        studentId,
        collectorId: null,
        pickupRightId: null,
        selfDismissal: true,
        comment: null,
    });
}