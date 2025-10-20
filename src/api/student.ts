import axios from "axios";
import {StudentDTO} from "@/src/types/student";

export async function fetchStudents(params: { name?: string; groupId?: number }) {
    const res = await axios.get('/api/students', { params });
    return res.data as StudentDTO[];
}