import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const libraryStatusEnum = pgEnum('library_status', [
  'want_to_play',
  'playing',
  'completed',
]);

export const games = pgTable('games', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalId: integer('external_id').unique(), // id RAWG, pour dédupliquer
  title: varchar('title', { length: 255 }).notNull(),
  platform: varchar('platform', { length: 100 }),
  releaseYear: integer('release_year'),
  coverUrl: text('cover_url'),
  genres: text('genres').array(), // tableau de strings, utile pour la Phase 5 (reco)
  metacriticRating: integer('metacritic_rating'),
  popularity: integer('popularity'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const libraryEntries = pgTable('library_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  status: libraryStatusEnum('status').notNull().default('want_to_play'),
  rating: integer('rating'), // 1-10, nullable tant que pas noté
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
