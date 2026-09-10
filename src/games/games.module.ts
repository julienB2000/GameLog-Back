import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { DrizzleModule } from 'src/db/drizzle.module';
import { GamesImportService } from './games-import.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [DrizzleModule, RedisModule],
  providers: [GamesService, GamesImportService],
  controllers: [GamesController],
  exports: [GamesService],
})
export class GamesModule {}
