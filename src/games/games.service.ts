import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from '../db/schema';
import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  ilike,
  sql,
  SQL,
} from 'drizzle-orm';
import {
  CreateGameDto,
  FindGamesQuery,
  UpdateGameDto,
} from './dto/games.schema.dto';

import { RedisAsyncProvider } from '../redis/redis.provider';
import Redis from 'ioredis';

@Injectable()
export class GamesService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(RedisAsyncProvider) private readonly redis: Redis,
  ) {}

  async create(data: CreateGameDto) {
    const result = await this.db.insert(schema.games).values(data).returning();
    return result[0];
  }

  async findAll(query: FindGamesQuery) {
    const { search, platform, genre, sortBy, page, limit } = query;
    const cacheKey = `games:list:${search ?? ''}:${platform ?? ''}:${genre ?? ''}:${sortBy}:${page}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];
    if (search) conditions.push(ilike(schema.games.title, `%${search}%`));
    if (platform) conditions.push(eq(schema.games.platform, platform));
    if (genre) conditions.push(arrayContains(schema.games.genres, [genre]));

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const orderByClause =
      sortBy === 'rating'
        ? desc(schema.games.metacriticRating)
        : sortBy === 'title'
          ? asc(schema.games.title)
          : desc(schema.games.popularity);

    const [data, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(schema.games)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(schema.games).where(whereClause),
    ]);

    const response = {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    await this.redis.set(cacheKey, JSON.stringify(response), 'EX', 3600);
    return response;
  }

  async findPlatforms() {
    const result = await this.db
      .selectDistinct({ platform: schema.games.platform })
      .from(schema.games);
    return result.map((r) => r.platform).filter(Boolean);
  }

  async findOne(id: string) {
    const result = await this.db
      .select()
      .from(schema.games)
      .where(eq(schema.games.id, id));

    const game = result[0] ?? null;
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  async update(id: string, data: UpdateGameDto) {
    // findOne lève déjà une NotFoundException si le jeu n'existe pas
    await this.findOne(id);

    const result = await this.db
      .update(schema.games)
      .set(data)
      .where(eq(schema.games.id, id))
      .returning();
    return result[0];
  }

  async remove(id: string) {
    await this.findOne(id);

    const result = await this.db
      .delete(schema.games)
      .where(eq(schema.games.id, id))
      .returning();
    return result[0];
  }
  async findGenres() {
    const result = await this.db.execute<{ genre: string }>(
      sql`SELECT DISTINCT unnest(genres) as genre FROM games ORDER BY genre`,
    );
    return result.rows.map((r) => r.genre);
  }
}
