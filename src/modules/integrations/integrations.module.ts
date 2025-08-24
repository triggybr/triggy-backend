import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { Integration, IntegrationSchema } from './schemas/integration.schema';
import { UserIntegration, UserIntegrationSchema } from './schemas/user-integration.schema';
import { UserStats, UserStatsSchema } from './schemas/user-stats.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Signature, SignatureSchema } from '../user/schemas/signature.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Integration.name, schema: IntegrationSchema },
      { name: UserIntegration.name, schema: UserIntegrationSchema },
      { name: UserStats.name, schema: UserStatsSchema },
      { name: User.name, schema: UserSchema },
      { name: Signature.name, schema: SignatureSchema },
    ]),
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}