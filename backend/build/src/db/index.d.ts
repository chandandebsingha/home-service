import postgres from 'postgres';
import * as schema from '../../build/drizzle/schema';
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
//# sourceMappingURL=index.d.ts.map