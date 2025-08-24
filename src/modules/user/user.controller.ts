import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserWebhookDto } from './dto/create-user-webhook.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async createFromWebhook(@Body() webhookData: CreateUserWebhookDto) {
    if (webhookData.type !== 'user.created') {
      return;
    }

    const primaryEmail = webhookData.data.email_addresses.find(
      email => email.id === webhookData.data.primary_email_address_id
    ) || webhookData.data.email_addresses[0];

    this.userService.createFromClerkWebhook({
      externalId: webhookData.data.id,
      email: primaryEmail.email_address,
    });
  }
} 