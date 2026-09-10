import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from '../db/schema';
import { and, count, eq, ilike, SQL } from 'drizzle-orm';
import {
  CreateGameDto,
  FindGamesQuery,
  UpdateGameDto,
} from './dto/games.schema.dto';

@Injectable()
export class GamesService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: CreateGameDto) {
    const result = await this.db.insert(schema.games).values(data).returning();
    return result[0];
  }

  async findAll(query: FindGamesQuery) {
    const { search, platform, page, limit } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (search) conditions.push(ilike(schema.games.title, `%${search}%`));
    if (platform) conditions.push(eq(schema.games.platform, platform));

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [data, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(schema.games)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(schema.games).where(whereClause),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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
}
