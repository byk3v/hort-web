type NewPermissionRequest = {
    studentId: number;
    kind: "TAGES" | "DAUER";         // Tagesvollmacht vs Dauervollmacht
    canLeaveAlone: boolean;          // true => SelfDismissal, false => PickupRight
    // Common validity inputs from the UI:
    // For TAGES: same day in both
    validFrom?: string;              // ISO Datetime "2025-10-28T15:30:00"
    validUntil?: string | null;      // null si indefinido
    // CASE canLeaveAlone = false -> need collector info:
    collector?: {
        firstName: string;
        lastName: string;
        address: string;
        phone?: string;
    };
    // CASE canLeaveAlone = true AND kind = "DAUER" -> weekly times:
    weeklyAllowedFrom?: {
        monday?: string; // "15:30"
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
    };
    // CASE canLeaveAlone = true AND kind = "TAGES" -> simple allowedFromTime:
    allowedFromTime?: string; // "15:30"
};
