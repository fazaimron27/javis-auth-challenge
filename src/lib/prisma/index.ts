import { PrismaClient } from "@prisma/client";

/**
 * Database access module using Prisma ORM
 * 
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit during hot reloads.
 * Learn more: 
 * https://pris.ly/d/help/next-js-best-practices
 */

/**
 * Type definition for the global object to store PrismaClient instance
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Singleton PrismaClient instance
 * 
 * - Reuses existing connection in development
 * - Configures logging based on environment
 * - In production, creates a new client for each serverless function
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

/**
 * Save reference to PrismaClient in development to avoid multiple connections
 */
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;