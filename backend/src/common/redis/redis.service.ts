import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClient;
  private connectPromise: Promise<void> | null = null;

  constructor(config: ConfigService) {
    this.client = createClient({ url: config.getOrThrow<string>('REDIS_URL') });
    this.client.on('error', (error: Error) => {
      this.logger.warn(`Redis is unavailable: ${error.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.getConnectedClient();
    } catch {
      this.logger.warn(
        'Redis-dependent services are unavailable until Redis reconnects',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.quit();
  }

  async getConnectedClient(): Promise<RedisClient> {
    if (!this.client.isOpen) {
      if (!this.connectPromise) {
        this.connectPromise = this.client
          .connect()
          .then(() => undefined)
          .finally(() => {
            this.connectPromise = null;
          });
      }
      await this.connectPromise;
    } else if (this.connectPromise) {
      await this.connectPromise;
    }

    if (!this.client.isReady) await this.client.ping();
    return this.client;
  }
}
