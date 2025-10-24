import { db } from '../db';
import { providerProfiles, users, occupations } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export class ProviderProfileService {
  static async create(newProfile: typeof providerProfiles.$inferInsert) {
    const [created] = await db.insert(providerProfiles).values(newProfile).returning();
    return created;
  }

  static async getByUserId(userId: number) {
    const rows = await db
      .select({
        id: providerProfiles.id,
        userId: providerProfiles.userId,
        occupationId: providerProfiles.occupationId,
        businessName: providerProfiles.businessName,
        businessAddress: providerProfiles.businessAddress,
        phoneNumber: providerProfiles.phoneNumber,
        experience: providerProfiles.experience,
        skills: providerProfiles.skills,
        certifications: providerProfiles.certifications,
        bio: providerProfiles.bio,
        isVerified: providerProfiles.isVerified,
        isActive: providerProfiles.isActive,
        createdAt: providerProfiles.createdAt,
        updatedAt: providerProfiles.updatedAt,
        // Join with user and occupation data
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
        occupation: {
          id: occupations.id,
          name: occupations.name,
          description: occupations.description,
        },
      })
      .from(providerProfiles)
      .leftJoin(users, eq(providerProfiles.userId, users.id))
      .leftJoin(occupations, eq(providerProfiles.occupationId, occupations.id))
      .where(eq(providerProfiles.userId, userId))
      .limit(1);
    
    const profile = rows[0];
    if (profile) {
      // Parse JSON fields
      profile.skills = profile.skills ? JSON.parse(profile.skills) : null;
      profile.certifications = profile.certifications ? JSON.parse(profile.certifications) : null;
    }
    return profile || null;
  }

  static async getAll() {
    const rows = await db
      .select({
        id: providerProfiles.id,
        userId: providerProfiles.userId,
        occupationId: providerProfiles.occupationId,
        businessName: providerProfiles.businessName,
        businessAddress: providerProfiles.businessAddress,
        phoneNumber: providerProfiles.phoneNumber,
        experience: providerProfiles.experience,
        skills: providerProfiles.skills,
        certifications: providerProfiles.certifications,
        bio: providerProfiles.bio,
        isVerified: providerProfiles.isVerified,
        isActive: providerProfiles.isActive,
        createdAt: providerProfiles.createdAt,
        updatedAt: providerProfiles.updatedAt,
        // Join with user and occupation data
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
        occupation: {
          id: occupations.id,
          name: occupations.name,
          description: occupations.description,
        },
      })
      .from(providerProfiles)
      .leftJoin(users, eq(providerProfiles.userId, users.id))
      .leftJoin(occupations, eq(providerProfiles.occupationId, occupations.id));
    
    // Parse JSON fields for all profiles
    return rows.map(profile => ({
      ...profile,
      skills: profile.skills ? JSON.parse(profile.skills) : null,
      certifications: profile.certifications ? JSON.parse(profile.certifications) : null,
    }));
  }

  static async update(id: number, updates: Partial<typeof providerProfiles.$inferInsert>) {
    const [updated] = await db.update(providerProfiles).set(updates).where(eq(providerProfiles.id, id)).returning();
    return updated;
  }

  static async updateByUserId(userId: number, updates: Partial<typeof providerProfiles.$inferInsert>) {
    const [updated] = await db.update(providerProfiles).set(updates).where(eq(providerProfiles.userId, userId)).returning();
    return updated;
  }
}
