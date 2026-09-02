// src/library/library.schema.dto.ts
import { z } from 'zod';

export const libraryStatusValues = [
  'want_to_play',
  'playing',
  'completed',
] as const;

export const createLibraryEntrySchema = z.object({
  gameId: z.string().uuid(),
  status: z.enum(libraryStatusValues).optional().default('want_to_play'),
  rating: z.number().int().min(1).max(10).optional(),
  comment: z.string().optional(),
});

export const updateLibraryEntrySchema = z.object({
  status: z.enum(libraryStatusValues).optional(),
  rating: z.number().int().min(1).max(10).optional(),
  comment: z.string().optional(),
});

export type CreateLibraryEntryDto = z.infer<typeof createLibraryEntrySchema>;
export type UpdateLibraryEntryDto = z.infer<typeof updateLibraryEntrySchema>;
