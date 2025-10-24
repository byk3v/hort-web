export interface CollectorForOnboarding {
    firstName: string;
    lastName: string;
    address: string;
    phone?: string;
    validFrom: string;
    validUntil: string;
    type: "COLLECTOR";
    permissionType: "PERMANENT";
    mainCollector: boolean;
}