import { PrismaClient } from '@prisma/client'

const rawDatabaseUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;

function isLocalDatabaseUrl(connectionString?: string): boolean {
    if (!connectionString) return false;
    return /localhost|127\.0\.0\.1/i.test(connectionString) || /sslmode=disable\b/i.test(connectionString);
}

function getSafeDatabaseUrl(connectionString?: string): string | undefined {
    if (!connectionString) return undefined;

    if (isLocalDatabaseUrl(connectionString)) {
        return connectionString;
    }

    const needsExplicitVerifyFull = /sslmode=(prefer|require|verify-ca)\b/i.test(connectionString)
        && !/sslmode=verify-full\b/i.test(connectionString);

    if (!needsExplicitVerifyFull) return connectionString;

    return connectionString.replace(/sslmode=(prefer|require|verify-ca)\b/i, 'sslmode=verify-full');
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const safeUrl = getSafeDatabaseUrl(rawDatabaseUrl);

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasourceUrl: safeUrl
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
