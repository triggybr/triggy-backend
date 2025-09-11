import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { UserIntegration } from '../../integrations/schemas/user-integration.schema';
import { DestinationMapper, MapperResponse } from '../contracts/destination-mapper.interface';
import { DESTINATION_MAPPERS } from '../constants/tokens';

@Injectable()
export class EventMappingOrchestrator implements OnModuleInit {
  private readonly logger = new Logger(EventMappingOrchestrator.name);
  private readonly mapperMap = new Map<string, DestinationMapper>();

  constructor(
    @Inject(DESTINATION_MAPPERS) private readonly mappers: DestinationMapper[],
  ) {}

  onModuleInit() {
    for (const mapper of this.mappers) {
      const key = mapper.key();
      this.mapperMap.set(key, mapper);
      this.logger.debug(`Registered mapper for ${key}`);
    }
    this.logger.log(`Registered ${this.mapperMap.size} destination mappers`);
  }

  async execute(payload: any, integration: UserIntegration): Promise<MapperResponse> {
    const key = `${integration.source.platform}:${integration.source.event}__${integration.destination.platform}:${integration.destination.action}`;

    const mapper = this.mapperMap.get(key);
    if (!mapper) {
      throw new Error(`No destination mapper found for ${key}`);
    }

    if (!mapper.supports(integration.source.platform, integration.source.event, integration.destination.platform, integration.destination.action)) {
      throw new Error(`Destination mapper ${key} does not support ${integration.source.platform}:${integration.source.event}__${integration.destination.platform}:${integration.destination.action}`);
    }

    this.logger.debug(`Mapped and dispatched for ${key} (integration ${integration.id})`);
    return mapper.mapAndDispatch(payload, integration);
  }
}
