import { db } from "../db";
import * as schema from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export class ReviewService {
	static async getByBookingId(bookingId: number) {
		const rows = await db
			.select()
			.from(schema.reviews)
			.where(eq(schema.reviews.bookingId, bookingId))
			.limit(1);
		return rows[0] || null;
	}

	static async create(payload: schema.NewReview) {
		const [created] = await db
			.insert(schema.reviews)
			.values(payload)
			.returning();
		return created;
	}

	static async averageForProvider(providerId: number) {
		const rows = await db
			.select({
				avg: sql<number>`avg(${schema.reviews.rating})`,
				count: sql<number>`count(*)`,
			})
			.from(schema.reviews)
			.where(eq(schema.reviews.providerId, providerId));
		const row = rows?.[0] as any;
		const avg = row?.avg != null ? Number(row.avg) : 0;
		const count = row?.count != null ? Number(row.count) : 0;
		return { averageRating: avg, ratingsCount: count };
	}
}
