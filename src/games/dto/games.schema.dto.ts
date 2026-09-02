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
