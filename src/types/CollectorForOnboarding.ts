export interface CollectorForOnboarding {
    firstName: string;
    lastName: string;
    address: string;
    phone?: string;
    validFrom: string | null;
    validUntil: string | null;
    type: "COLLECTOR";
    permissionType: "PERMANENT";
    mainCollector: boolean;
}