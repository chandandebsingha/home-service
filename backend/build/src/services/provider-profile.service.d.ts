import { providerProfiles } from '../../drizzle/schema';
export declare class ProviderProfileService {
    static create(newProfile: typeof providerProfiles.$inferInsert): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        isActive: boolean;
        occupationId: number | null;
        businessName: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        experience: string | null;
        skills: string | null;
        certifications: string | null;
        bio: string | null;
        isVerified: boolean;
    }>;
    static getByUserId(userId: number): Promise<{
        id: number;
        userId: number;
        occupationId: number | null;
        businessName: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        experience: string | null;
        skills: string | null;
        certifications: string | null;
        bio: string | null;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: number;
            fullName: string;
            email: string;
        } | null;
        occupation: {
            id: number;
            name: string;
            description: string | null;
        } | null;
    }>;
    static getAll(): Promise<{
        skills: any;
        certifications: any;
        id: number;
        userId: number;
        occupationId: number | null;
        businessName: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        experience: string | null;
        bio: string | null;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: number;
            fullName: string;
            email: string;
        } | null;
        occupation: {
            id: number;
            name: string;
            description: string | null;
        } | null;
    }[]>;
    static update(id: number, updates: Partial<typeof providerProfiles.$inferInsert>): Promise<{
        id: number;
        userId: number;
        occupationId: number | null;
        businessName: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        experience: string | null;
        skills: string | null;
        certifications: string | null;
        bio: string | null;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static updateByUserId(userId: number, updates: Partial<typeof providerProfiles.$inferInsert>): Promise<{
        id: number;
        userId: number;
        occupationId: number | null;
        businessName: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        experience: string | null;
        skills: string | null;
        certifications: string | null;
        bio: string | null;
        isVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=provider-profile.service.d.ts.map