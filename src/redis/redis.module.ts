import { Module } from '@nestjs/common';
import { RedisAsyncProvider, redisProvider } from './redis.provider';

@Module({
  providers: [...redisProvider],
  exports: [RedisAsyncProvider],
})
export class RedisModule {}
