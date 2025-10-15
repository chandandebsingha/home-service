import * as schema from '../../drizzle/schema';
export declare class BookingService {
    static ensureServiceExists(serviceId: number): Promise<boolean>;
    static create(payload: schema.NewBooking): Promise<{
        date: string;
        id: number;
        createdAt: Date;
        userId: number;
        price: number;
        serviceId: number;
        time: string;
        address: string;
        specialInstructions: string | null;
        status: string;
    }>;
    static listByUser(userId: number): Promise<{
        id: number;
        userId: number;
        serviceId: number;
        date: string;
        time: string;
        address: string;
        specialInstructions: string | null;
        price: number;
        status: string;
        createdAt: Date;
    }[]>;
    static listByProvider(providerId: number): Promise<{
        id: number;
        userId: number;
        serviceId: number;
        date: string;
        time: string;
        address: string;
        specialInstructions: string | null;
        price: number;
        status: string;
        createdAt: Date;
    }[]>;
    static getById(id: number): Promise<{
        id: number;
        userId: number;
        serviceId: number;
        date: string;
        time: string;
        address: string;
        specialInstructions: string | null;
        price: number;
        status: string;
        createdAt: Date;
    }>;
    static updateStatus(id: number, status: string): Promise<{
        id: number;
        userId: number;
        serviceId: number;
        date: string;
        time: string;
        address: string;
        specialInstructions: string | null;
        price: number;
        status: string;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=booking.service.d.ts.map