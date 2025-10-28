import { api } from "@/src/lib/axios";
import {StudentDTO} from "@/src/types/student";
import {StudentOnboardingRequest} from "@/src/types/StudentOnboardingRequest";
import {PermissionViewDto} from "@/src/types/PermissionViewDto";

export type GetStudentsParams = { name?: string; groupId?: number };

export async function fetchPermissions(status: "ACTIVE" | "ALL" = "ACTIVE") {
    const { data } = await api.get<PermissionViewDto[]>("/permissions", {
        params: { status },
    });
    return data;
}

export async function createNewPermission(req: NewPermissionRequest) {
    const { data } = await api.post("/permissions", req);
    return data;
}