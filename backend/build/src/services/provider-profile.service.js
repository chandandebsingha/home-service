"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderProfileService = void 0;
const db_1 = require("../db");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class ProviderProfileService {
    static async create(newProfile) {
        const [created] = await db_1.db.insert(schema_1.providerProfiles).values(newProfile).returning();
        return created;
    }
    static async getByUserId(userId) {
        const rows = await db_1.db
            .select({
            id: schema_1.providerProfiles.id,
            userId: schema_1.providerProfiles.userId,
            occupationId: schema_1.providerProfiles.occupationId,
            businessName: schema_1.providerProfiles.businessName,
            businessAddress: schema_1.providerProfiles.businessAddress,
            phoneNumber: schema_1.providerProfiles.phoneNumber,
            experience: schema_1.providerProfiles.experience,
            skills: schema_1.providerProfiles.skills,
            certifications: schema_1.providerProfiles.certifications,
            bio: schema_1.providerProfiles.bio,
            isVerified: schema_1.providerProfiles.isVerified,
            isActive: schema_1.providerProfiles.isActive,
            createdAt: schema_1.providerProfiles.createdAt,
            updatedAt: schema_1.providerProfiles.updatedAt,
            user: {
                id: schema_1.users.id,
                fullName: schema_1.users.fullName,
                email: schema_1.users.email,
            },
            occupation: {
                id: schema_1.occupations.id,
                name: schema_1.occupations.name,
                description: schema_1.occupations.description,
            },
        })
            .from(schema_1.providerProfiles)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.providerProfiles.userId, schema_1.users.id))
            .leftJoin(schema_1.occupations, (0, drizzle_orm_1.eq)(schema_1.providerProfiles.occupationId, schema_1.occupations.id))
            .where((0, drizzle_orm_1.eq)(schema_1.providerProfiles.userId, userId))
            .limit(1);
        const profile = rows[0];
        if (profile) {
            profile.skills = profile.skills ? JSON.parse(profile.skills) : null;
            profile.certifications = profile.certifications ? JSON.parse(profile.certifications) : null;
        }
        return profile || null;
    }
    static async getAll() {
        const rows = await db_1.db
            .select({
            id: schema_1.providerProfiles.id,
            userId: schema_1.providerProfiles.userId,
            occupationId: schema_1.providerProfiles.occupationId,
            businessName: schema_1.providerProfiles.businessName,
            businessAddress: schema_1.providerProfiles.businessAddress,
            phoneNumber: schema_1.providerProfiles.phoneNumber,
            experience: schema_1.providerProfiles.experience,
            skills: schema_1.providerProfiles.skills,
            certifications: schema_1.providerProfiles.certifications,
            bio: schema_1.providerProfiles.bio,
            isVerified: schema_1.providerProfiles.isVerified,
            isActive: schema_1.providerProfiles.isActive,
            createdAt: schema_1.providerProfiles.createdAt,
            updatedAt: schema_1.providerProfiles.updatedAt,
            user: {
                id: schema_1.users.id,
                fullName: schema_1.users.fullName,
                email: schema_1.users.email,
            },
            occupation: {
                id: schema_1.occupations.id,
                name: schema_1.occupations.name,
                description: schema_1.occupations.description,
            },
        })
            .from(schema_1.providerProfiles)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.providerProfiles.userId, schema_1.users.id))
            .leftJoin(schema_1.occupations, (0, drizzle_orm_1.eq)(schema_1.providerProfiles.occupationId, schema_1.occupations.id));
        return rows.map(profile => ({
            ...profile,
            skills: profile.skills ? JSON.parse(profile.skills) : null,
            certifications: profile.certifications ? JSON.parse(profile.certifications) : null,
        }));
    }
    static async update(id, updates) {
        const [updated] = await db_1.db.update(schema_1.providerProfiles).set(updates).where((0, drizzle_orm_1.eq)(schema_1.providerProfiles.id, id)).returning();
        return updated;
    }
    static async updateByUserId(userId, updates) {
        const [updated] = await db_1.db.update(schema_1.providerProfiles).set(updates).where((0, drizzle_orm_1.eq)(schema_1.providerProfiles.userId, userId)).returning();
        return updated;
    }
}
exports.ProviderProfileService = ProviderProfileService;
//# sourceMappingURL=provider-profile.service.js.map