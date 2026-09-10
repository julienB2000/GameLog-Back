import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { games } from '../src/db/schema';

dotenv.config();

const seedGames = [
  {
    title: 'Hollow Knight',
    platform: 'PC',
    releaseYear: 2017,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
  },
  {
    title: 'The Witcher 3: Wild Hunt',
    platform: 'PC',
    releaseYear: 2015,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
  },
  {
    title: 'Stardew Valley',
    platform: 'PC',
    releaseYear: 2016,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
  },
  {
    title: 'Celeste',
    platform: 'PC',
    releaseYear: 2018,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg',
  },
  {
    title: 'Hades',
    platform: 'PC',
    releaseYear: 2020,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg',
  },
  {
    title: 'Portal 2',
    platform: 'PC',
    releaseYear: 2011,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg',
  },
  {
    title: 'Half-Life 2',
    platform: 'PC',
    releaseYear: 2004,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg',
  },
  {
    title: 'Dark Souls III',
    platform: 'PC',
    releaseYear: 2016,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg',
  },
  {
    title: 'Elden Ring',
    platform: 'PC',
    releaseYear: 2022,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
  },
  {
    title: 'Cyberpunk 2077',
    platform: 'PC',
    releaseYear: 2020,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
  },
  {
    title: "Baldur's Gate 3",
    platform: 'PC',
    releaseYear: 2023,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg',
  },
  {
    title: 'Disco Elysium',
    platform: 'PC',
    releaseYear: 2019,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg',
  },
  {
    title: 'Undertale',
    platform: 'PC',
    releaseYear: 2015,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/header.jpg',
  },
  {
    title: 'Terraria',
    platform: 'PC',
    releaseYear: 2011,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg',
  },
  {
    title: 'Grand Theft Auto V',
    platform: 'PC',
    releaseYear: 2015,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
  },
  {
    title: 'Red Dead Redemption 2',
    platform: 'PC',
    releaseYear: 2019,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
  },
  {
    title: 'The Elder Scrolls V: Skyrim',
    platform: 'PC',
    releaseYear: 2011,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/489830/header.jpg',
  },
  {
    title: 'Doom Eternal',
    platform: 'PC',
    releaseYear: 2020,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg',
  },
  {
    title: 'Sekiro: Shadows Die Twice',
    platform: 'PC',
    releaseYear: 2019,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg',
  },
  {
    title: 'Outer Wilds',
    platform: 'PC',
    releaseYear: 2019,
    coverUrl:
      'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/header.jpg',
  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log(`Seeding ${seedGames.length} games...`);

  for (const game of seedGames) {
    await db.insert(games).values(game).onConflictDoNothing();
  }

  console.log('Seed terminé.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Erreur pendant le seed:', err);
  process.exit(1);
});
