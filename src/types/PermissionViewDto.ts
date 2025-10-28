export type PermissionViewDto = {
    permissionId: number;
    permissionKind: "COLLECTOR" | "SELF_DISMISSAL";
    studentId: number;
    studentFirstName: string;
    studentLastName: string;
    studentGroupName: string | null;
    collectorId: number | null;
    collectorFirstName: string | null;
    collectorLastName: string | null;
    collectorPhone: string | null;
    validFrom: string | null;        // ISO string
    validUntil: string | null;       // ISO string or null
    allowedFromTime: string | null;  // "15:30" etc
    status: string;                  // "ACTIVE", ...
};