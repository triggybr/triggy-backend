import { UserIntegration } from '../../integrations/schemas/user-integration.schema';

export type MapperResponse = {
  mappedPayload: any;
  responseStatus: number;
  responseTime: number;
}

export interface DestinationMapper {
  key(): string;
  supports(sourcePlatform: string, sourceEvent: string, destPlatform: string, destAction: string): boolean;
  mapAndDispatch(payload: any, integration: UserIntegration): Promise<MapperResponse>;
}
