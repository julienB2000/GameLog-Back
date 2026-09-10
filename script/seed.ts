// scripts/import-top-games.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { games } from '../src/db/schema';
import { rawgResponseSchema, RawgGame } from '../src/games/dto/rawg.schema';

dotenv.config();

const PAGE_SIZE = 40;
const TARGET_COUNT = 1000;
const DELAY_MS = 300;

async function insertGames(
  db: ReturnType<typeof drizzle>,
  rawgGames: RawgGame[],
) {
  const values = rawgGames.map((g) => ({
    externalId: g.id,
    title: g.name,
    coverUrl: g.background_image,
    releaseYear: g.released ? new Date(g.released).getFullYear() : null,
    platform: g.platforms?.[0]?.platform.name ?? null,
    metacriticRating: g.metacritic,
    popularity: g.added,
    genres: g.genres.map((genre) => genre.name),
  }));

  await db
    .insert(games)
    .values(values)
    .onConflictDoNothing({ target: games.externalId });
}

async function importTopGames() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    console.error('RAWG_API_KEY manquant dans .env');
    process.exit(1);
  }

  let imported = 0;
  let page = 1;

  console.log(`Démarrage import RAWG (cible : ${TARGET_COUNT} jeux)...`);

  while (imported < TARGET_COUNT) {
    const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=-added&page_size=${PAGE_SIZE}&page=${page}`;
    const response = await fetch(url);
    const rawData = await response.json();

    const parsed = rawgResponseSchema.safeParse(rawData);
    if (!parsed.success) {
      console.error(
        "Réponse RAWG invalide, arrêt de l'import:",
        parsed.error.format(),
      );
      break;
    }

    await insertGames(db, parsed.data.results);
    imported += parsed.data.results.length;
    console.log(`Page ${page} traitée — ${imported} jeux importés jusqu'ici`);

    if (!parsed.data.next) {
      console.log('Plus de pages disponibles côté RAWG.');
      break;
    }

    page++;
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }

  console.log(`Import terminé : ${imported} jeux traités.`);
  await pool.end();
}

importTopGames().catch((err) => {
  console.error("Erreur pendant l'import:", err);
  process.exit(1);
});
