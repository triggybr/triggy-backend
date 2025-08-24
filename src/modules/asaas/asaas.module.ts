import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AsaasService } from './asaas.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';

@Global()
@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.ASAAS_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ConectaPlus-API/1.0',
      },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [AsaasService],
  exports: [AsaasService],
})
export class AsaasModule {} 