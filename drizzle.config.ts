import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    //changer Dynamiquement avec .env
    url: 'postgresql://gamelog:gamelog@localhost:5433/gamelog',
  },
});
