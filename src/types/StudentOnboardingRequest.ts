import {CollectorForOnboarding} from "@/src/types/CollectorForOnboarding";

export interface StudentOnboardingRequest {
    student: {
        firstName: string;
        lastName: string;
        address: string;
        phone?: string;
    };
    groupId: number;
    collectors: CollectorForOnboarding[];
}