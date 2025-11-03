import * as schema from "../../drizzle/schema";
export declare class ReviewService {
    static getByBookingAndTarget(bookingId: number, target: "provider" | "customer"): Promise<{
        id: number;
        bookingId: number;
        userId: number | null;
        serviceId: number | null;
        providerId: number | null;
        reviewerId: number;
        revieweeId: number;
        target: "provider" | "customer";
        rating: number;
        comment: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static create(payload: schema.NewReview): Promise<{
        id: number;
        createdAt: Date;
        userId: number | null;
        updatedAt: Date;
        providerId: number | null;
        serviceId: number | null;
        bookingId: number;
        reviewerId: number;
        revieweeId: number;
        target: "provider" | "customer";
        rating: number;
        comment: string | null;
    }>;
    static averageForProvider(providerId: number): Promise<{
        averageRating: number;
        ratingsCount: number;
    }>;
}
//# sourceMappingURL=review.service.d.ts.map