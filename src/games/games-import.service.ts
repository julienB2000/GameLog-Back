import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DrizzleAsyncProvider } from '../db/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { rawgResponseSchema, RawgGame } from './dto/rawg.schema';

const PAGE_SIZE = 40;
const TARGET_COUNT = 1000;
const DELAY_MS = 300;

@Injectable()
export class GamesImportService {
  private readonly logger = new Logger(GamesImportService.name);

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async importTopGames() {
    this.logger.log('Démarrage import RAWG...');
    const apiKey = this.configService.get<string>('RAWG_API_KEY');
    let imported = 0;
    let page = 1;

    while (imported < TARGET_COUNT) {
      const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=-added&page_size=${PAGE_SIZE}&page=${page}`;
      const response = await fetch(url);
      const rawData = await response.json();

      const parsed = rawgResponseSchema.safeParse(rawData);
      if (!parsed.success) {
        this.logger.error(
          "Réponse RAWG invalide, arrêt de l'import",
          parsed.error,
        );
        break;
      }

      await this.insertGames(parsed.data.results);
      imported += parsed.data.results.length;

      if (!parsed.data.next) break; // plus de pages disponibles
      page++;
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }

    this.logger.log(`Import RAWG terminé : ${imported} jeux traités.`);
  }

  private async insertGames(rawgGames: RawgGame[]) {
    const values = rawgGames.map((g) => ({
      externalId: g.id,
      title: g.name,
      coverUrl: g.background_image,
      releaseYear: g.released ? new Date(g.released).getFullYear() : null,
      platform: g.platforms?.[0]?.platform.name ?? null,
      metacriticRating: g.metacritic,
      popularity: g.added,
      genres: g.genres.map((genre) => genre.name),
    }));

    await this.db
      .insert(schema.games)
      .values(values)
      .onConflictDoNothing({ target: schema.games.externalId });
  }
}
