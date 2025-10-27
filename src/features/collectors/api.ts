import { api } from "@/src/lib/axios";
import {CollectorDTO} from "@/src/types/student";

export async function getCollectors() {
    const { data } = await api.get<CollectorDTO[]>("/collectors");
    return data;
}