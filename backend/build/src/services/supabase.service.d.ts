export declare class SupabaseService {
    private static clientPromise;
    private static getClient;
    static signUp(email: string, password: string, metadata?: any): Promise<any>;
    static signIn(email: string, password: string): Promise<any>;
    static signOut(): Promise<void>;
    static getUser(accessToken: string): Promise<any>;
    static updateUser(attributes: any): Promise<any>;
    static adminCreateUser(email: string, password: string, metadata?: any): Promise<any>;
}
//# sourceMappingURL=supabase.service.d.ts.map