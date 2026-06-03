import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './config.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async getConfig(
    entityType: string,
    entityId: string,
  ): Promise<Record<string, unknown>> {
    const configs = await this.configRepository.find({
      where: { entityType, entityId },
    });

    // Convert array of key-value into a single object
    return configs.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }

  async updateConfig(
    entityType: string,
    entityId: string,
    updates: Record<string, unknown>,
  ): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      let config = await this.configRepository.findOne({
        where: { entityType, entityId, key },
      });

      if (config) {
        config.value = value;
      } else {
        config = this.configRepository.create({
          entityType,
          entityId,
          key,
          value,
        });
      }
      await this.configRepository.save(config);
    }
  }
}
