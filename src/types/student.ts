export interface CollectorDTO {
    firstName: string;
    lastName: string;
    address?: string;
    phone?: string;
}

export interface StudentDTO {
    id: number;
    firstName: string;
    lastName: string;
    address?: string;
    group: string;
    collectors: CollectorDTO[];
}
