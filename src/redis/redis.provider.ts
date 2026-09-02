import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const RedisAsyncProvider = 'RedisAsyncProvider';

export const redisProvider = [
  {
    provide: RedisAsyncProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const redisUrl = process.env.REDIS_URL;
      const client = new Redis(redisUrl!);

      client.on('error', (err) => {
        console.error('Redis connection error:', err);
      });

      return client;
    },
  },
];
