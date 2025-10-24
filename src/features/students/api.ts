import { api } from "@/src/lib/axios";
import {StudentDTO} from "@/src/types/student";
import {StudentOnboardingRequest} from "@/src/types/StudentOnboardingRequest";

export type GetStudentsParams = { name?: string; groupId?: number };

export async function getStudents(params: GetStudentsParams = {}) {
    const { data } = await api.get<StudentDTO[]>("/students", { params });
    return data;
}

export async function createStudentOnboarding(req: StudentOnboardingRequest) {
    const { data } = await api.post("/students", req);
    return data;
}