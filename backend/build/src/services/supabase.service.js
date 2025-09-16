"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const config_1 = require("../types/config");
class SupabaseService {
    static async getClient() {
        if (!this.clientPromise) {
            this.clientPromise = (async () => {
                const mod = await Promise.resolve().then(() => __importStar(require('@supabase/supabase-js')));
                const createClient = mod.createClient;
                return createClient(config_1.config.supabaseUrl, config_1.config.supabaseServiceKey);
            })();
        }
        return this.clientPromise;
    }
    static async signUp(email, password, metadata) {
        const supabase = await this.getClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        if (error)
            throw error;
        return data;
    }
    static async signIn(email, password) {
        const supabase = await this.getClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            throw error;
        return data;
    }
    static async signOut() {
        const supabase = await this.getClient();
        const { error } = await supabase.auth.signOut();
        if (error)
            throw error;
    }
    static async getUser(accessToken) {
        const supabase = await this.getClient();
        const { data, error } = await supabase.auth.getUser(accessToken);
        if (error)
            throw error;
        return data;
    }
    static async updateUser(attributes) {
        const supabase = await this.getClient();
        const { data, error } = await supabase.auth.updateUser(attributes);
        if (error)
            throw error;
        return data;
    }
    static async adminCreateUser(email, password, metadata) {
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
        if (error)
            throw error;
        return data.user;
    }
}
exports.SupabaseService = SupabaseService;
SupabaseService.clientPromise = null;
//# sourceMappingURL=supabase.service.js.map