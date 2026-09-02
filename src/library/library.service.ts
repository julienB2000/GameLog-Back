import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from '../db/schema';
import { and, eq } from 'drizzle-orm';
import {
  CreateLibraryEntryDto,
  UpdateLibraryEntryDto,
} from './dto/library.schema.dto';

@Injectable()
export class LibraryService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(userId: string, data: CreateLibraryEntryDto) {
    const result = await this.db
      .insert(schema.libraryEntries)
      .values({ ...data, userId })
      .returning();
    return result[0];
  }

  async findAllForUser(userId: string) {
    // On récupère toutes les entrées de bibliothèque de l'utilisateur, et pour
    // chacune on va chercher le jeu correspondant via innerJoin sur
    // libraryEntries.gameId = games.id. Un innerJoin (plutôt qu'un leftJoin)
    // est correct ici car gameId est NOT NULL avec une contrainte de clé
    // étrangère : une entrée sans jeu associé ne peut pas exister. Le
    // .select({...}) explicite évite un objet imbriqué {libraryEntries, games}
    // et aplati le résultat en ne gardant que les colonnes utiles (statut,
    // note, commentaire côté entrée + titre/cover côté jeu).
    return this.db
      .select({
        id: schema.libraryEntries.id,
        gameId: schema.libraryEntries.gameId,
        status: schema.libraryEntries.status,
        rating: schema.libraryEntries.rating,
        comment: schema.libraryEntries.comment,
        createdAt: schema.libraryEntries.createdAt,
        updatedAt: schema.libraryEntries.updatedAt,
        game: {
          title: schema.games.title,
          platform: schema.games.platform,
          releaseYear: schema.games.releaseYear,
          coverUrl: schema.games.coverUrl,
        },
      })
      .from(schema.libraryEntries)
      .innerJoin(
        schema.games,
        eq(schema.libraryEntries.gameId, schema.games.id),
      )
      .where(eq(schema.libraryEntries.userId, userId));
  }

  async findOne(userId: string, entryId: string) {
    const result = await this.db
      .select()
      .from(schema.libraryEntries)
      .where(
        and(
          eq(schema.libraryEntries.id, entryId),
          eq(schema.libraryEntries.userId, userId),
        ),
      );

    const entry = result[0] ?? null;
    if (!entry) {
      // 404 plutôt que 403 : on ne révèle pas qu'une entrée appartenant à
      // un autre utilisateur existe.
      throw new NotFoundException('Library entry not found');
    }
    return entry;
  }

  async update(userId: string, entryId: string, data: UpdateLibraryEntryDto) {
    // vérifie l'appartenance (lève 404 sinon)
    await this.findOne(userId, entryId);

    const result = await this.db
      .update(schema.libraryEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(schema.libraryEntries.id, entryId),
          eq(schema.libraryEntries.userId, userId),
        ),
      )
      .returning();
    return result[0];
  }

  async remove(userId: string, entryId: string) {
    await this.findOne(userId, entryId);

    const result = await this.db
      .delete(schema.libraryEntries)
      .where(
        and(
          eq(schema.libraryEntries.id, entryId),
          eq(schema.libraryEntries.userId, userId),
        ),
      )
      .returning();
    return result[0];
  }
}
