import { z } from 'zod';

const rawgGameSchema = z.object({
  id: z.number(),
  name: z.string(),
  background_image: z.string().nullable(),
  released: z.string().nullable(),
  metacritic: z.number().nullable(),
  added: z.number(),
  platforms: z
    .array(z.object({ platform: z.object({ name: z.string() }) }))
    .nullable(),
  genres: z.array(z.object({ name: z.string() })),
});

export const rawgResponseSchema = z.object({
  results: z.array(rawgGameSchema),
  next: z.string().nullable(),
});

export type RawgGame = z.infer<typeof rawgGameSchema>;
