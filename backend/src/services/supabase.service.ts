import { config } from "../types/config";

export class SupabaseService {
	private static clientPromise: Promise<any> | null = null;

	private static async getClient() {
		if (!this.clientPromise) {
			this.clientPromise = (async () => {
				const mod = await import("@supabase/supabase-js");
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
				data: metadata,
			},
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

	static async findUserByEmail(email: string) {
		const supabase = await this.getClient();
		if (!supabase.auth?.admin?.listUsers) {
			throw new Error("Supabase admin API not available");
		}

		let page = 1;
		const perPage = 1000;
		const maxPages = 10; // safety cap

		while (page <= maxPages) {
			const { data, error } = await supabase.auth.admin.listUsers({
				page,
				perPage,
			});
			if (error) throw error;
			const found = data?.users?.find(
				(u: any) => (u?.email || "").toLowerCase() === email.toLowerCase()
			);
			if (found) return found;
			if (!data || !Array.isArray(data.users) || data.users.length < perPage)
				break; // no more pages
			page += 1;
		}
		return null;
	}

	static async adminCreateUser(
		email: string,
		password: string,
		metadata?: any
	) {
		const supabase = await this.getClient();
		if (!supabase.auth?.admin?.createUser) {
			throw new Error("Supabase admin API not available");
		}
		const { data, error } = await supabase.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: metadata,
		});

		if (error) {
			// If the user already exists, fetch and return it instead of failing
			const code = (error as any)?.code || (error as any)?.error?.code;
			const status = (error as any)?.status;
			if (status === 422 && code === "email_exists") {
				const existing = await this.findUserByEmail(email);
				if (existing) return existing;
			}
			throw error;
		}
		return data.user;
	}
}
