import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateGameDto, UpdateGameDto } from './dto/games.schema.dto';

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

  async findAll() {
    return this.db.select().from(schema.games);
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
