import { occupations } from '../../drizzle/schema';
export declare class OccupationService {
    private static ensureTable;
    static create(newOccupation: typeof occupations.$inferInsert): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        description: string | null;
        updatedAt: Date;
        isActive: boolean;
    }>;
    static list(): Promise<{
        id: number;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static getById(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static update(id: number, updates: Partial<typeof occupations.$inferInsert>): Promise<{
        id: number;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=occupation.service.d.ts.map