import * as schema from "../../drizzle/schema";
export declare class AddressesService {
    static create(payload: Partial<typeof schema.address.$inferInsert>): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        street: string;
        landmark: string | null;
        apartment: string | null;
        city: string;
        state: string;
        pinCode: string;
        country: string;
        latitude: string | null;
        longitude: string | null;
        isDefault: boolean;
        updatedAt: Date;
    }>;
    static listByUser(userId: number): Promise<{
        id: number;
        userId: number;
        street: string;
        landmark: string | null;
        apartment: string | null;
        city: string;
        state: string;
        pinCode: string;
        country: string;
        latitude: string | null;
        longitude: string | null;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static unsetDefaultForUser(userId: number): Promise<void>;
    static getById(id: number): Promise<{
        id: number;
        userId: number;
        street: string;
        landmark: string | null;
        apartment: string | null;
        city: string;
        state: string;
        pinCode: string;
        country: string;
        latitude: string | null;
        longitude: string | null;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static update(id: number, payload: Partial<typeof schema.address.$inferInsert>): Promise<{
        id: number;
        userId: number;
        street: string;
        landmark: string | null;
        apartment: string | null;
        city: string;
        state: string;
        pinCode: string;
        country: string;
        latitude: string | null;
        longitude: string | null;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        street: string;
        landmark: string | null;
        apartment: string | null;
        city: string;
        state: string;
        pinCode: string;
        country: string;
        latitude: string | null;
        longitude: string | null;
        isDefault: boolean;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=addresses.service.d.ts.map