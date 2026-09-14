// src/games/games.schema.dto.ts
import { z } from 'zod';

export const createGameSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  platform: z.string().max(100).optional(),
  releaseYear: z.number().int().optional(),
  coverUrl: z.string().url().optional(),
});

export const updateGameSchema = createGameSchema.partial();

export type CreateGameDto = z.infer<typeof createGameSchema>;
export type UpdateGameDto = z.infer<typeof updateGameSchema>;

export const findGamesQuerySchema = z.object({
  search: z.string().optional(),
  platform: z.string().optional(),
  genre: z.string().optional(),
  sortBy: z.enum(['popularity', 'rating', 'title']).default('popularity'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type FindGamesQuery = z.infer<typeof findGamesQuerySchema>;
