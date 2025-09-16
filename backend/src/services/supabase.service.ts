import { config } from '../types/config';

export class SupabaseService {
  private static clientPromise: Promise<any> | null = null;

  private static async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        const mod = await import('@supabase/supabase-js');
        const createClient = (mod as any).createClient;
        return createClient(config.supabaseUrl, config.supabaseServiceKey);
      })();
    }
    return this.clientPromise;
  }

  static async signUp(email: string, password: string, metadata?: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const supabase = await this.getClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getUser(accessToken: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error) throw error;
    return data;
  }

  static async updateUser(attributes: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase.auth.updateUser(attributes);
    if (error) throw error;
    return data;
  }

  static async adminCreateUser(email: string, password: string, metadata?: any) {
    const supabase = await this.getClient();
    if (!supabase.auth?.admin?.createUser) {
      throw new Error('Supabase admin API not available');
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) throw error;
    return data.user;
  }
}