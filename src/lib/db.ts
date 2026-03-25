import { Pool } from 'pg';

const rawDatabaseUrl = process.env.DATABASE_URL;

function getSafeDatabaseUrl(connectionString?: string): string | undefined {
    if (!connectionString) return undefined;

    const needsExplicitVerifyFull = /sslmode=(prefer|require|verify-ca)\b/i.test(connectionString)
        && !/sslmode=verify-full\b/i.test(connectionString);

    if (!needsExplicitVerifyFull) return connectionString;

    return connectionString.replace(/sslmode=(prefer|require|verify-ca)\b/i, 'sslmode=verify-full');
}

const pool = new Pool({
    connectionString: getSafeDatabaseUrl(rawDatabaseUrl),
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
