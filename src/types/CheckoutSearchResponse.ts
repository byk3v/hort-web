export type CheckoutCollectorInfo = {
    collectorId: number;
    firstName: string;
    lastName: string;
    phone: string | null;
    mainCollector: boolean;
    allowedFromTime: string | null; // "15:00:00"
    pickupRightId: number; // "15:00:00"
};

export type CheckoutStudentInfo = {
    studentId: number;
    firstName: string;
    lastName: string;
    groupName: string | null;
    canLeaveAloneToday: boolean;
    allowedToLeaveFromTime: string | null;
    selfDismissalId: number | null;
    allowedCollectors: CheckoutCollectorInfo[];
};

export type CheckoutSearchResponse = {
    students: CheckoutStudentInfo[];
};