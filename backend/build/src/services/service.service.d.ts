import { type NewService } from '../../drizzle/schema';
export declare class ServiceService {
    static create(newService: NewService): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        description: string | null;
        price: number;
        serviceType: string | null;
        durationMinutes: number | null;
        availability: boolean;
        timeSlots: string | null;
        updatedAt: Date;
    }>;
    static list(): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: number;
        serviceType: string | null;
        durationMinutes: number | null;
        availability: boolean;
        timeSlots: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
//# sourceMappingURL=service.service.d.ts.map