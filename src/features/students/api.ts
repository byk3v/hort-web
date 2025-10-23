import { api } from "@/src/lib/axios";
import {StudentDTO} from "@/src/types/student";

export type GetStudentsParams = { name?: string; groupId?: number };

export async function getStudents(params: GetStudentsParams = {}) {
    const { data } = await api.get<StudentDTO[]>("/students", { params });
    return data;
}

export async function createStudent(body: Omit<StudentDTO, "id">) {
    const { data } = await api.post<StudentDTO>("/students", body);
    return data;
}