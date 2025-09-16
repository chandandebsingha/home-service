import { createClient } from '@supabase/supabase-js';
import { config } from '../types/config';

export class SupabaseService {
  private static supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  static async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.supabase.auth.signUp({
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
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  static async getUser(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error) throw error;
    return data;
  }

  static async updateUser(attributes: any) {
    const { data, error } = await this.supabase.auth.updateUser(attributes);
    if (error) throw error;
    return data;
  }
}