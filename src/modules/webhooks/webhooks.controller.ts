import { Controller, Get, Query } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { ListWebhooksDto } from './dto/list-webhooks.dto';
import { Logger } from '@nestjs/common';

@Controller('webhooks')
export class WebhooksController {
  private logger = new Logger(WebhooksController.name)

  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  async list(@Query() query: ListWebhooksDto) {
    try {
      return this.webhooksService.listWebhooks(query);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
} 