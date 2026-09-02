//drizzle.provider.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: async () => {
      const connectionString = process.env.DATABASE_URL;
      const pool = new Pool({
        connectionString,
      });

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
