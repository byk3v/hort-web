import { api } from "@/src/lib/axios";
import {GroupDTO} from "@/src/types/group";

export async function getGroups() {
    const { data } = await api.get<GroupDTO[]>("/groups");
    return data;
}