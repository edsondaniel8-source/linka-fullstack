import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/database-schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 🚨 DEBUG: Verificar qual DATABASE_URL está sendo usada
console.log('🔧 [DB DEBUG] DATABASE_URL configurada:', process.env.DATABASE_URL ? 'EXISTE' : 'NÃO EXISTE');
console.log('🔧 [DB DEBUG] DATABASE_URL (mascarada):', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@'));
console.log('🔧 [DB DEBUG] Tentando conectar ao banco...');

// CORREÇÃO: Use o Pool corretamente
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });