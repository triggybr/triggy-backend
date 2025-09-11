import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhooksService } from './services/webhooks.service';
import { ListWebhooksDto } from './dto/list-webhooks.dto';
import { Logger } from '@nestjs/common';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private logger = new Logger(WebhooksController.name)

  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter webhooks' })
  @ApiResponse({ status: 200, description: 'A list of webhooks.' })
  async list(@Query() query: ListWebhooksDto) {
    try {
      return this.webhooksService.listWebhooks(query);
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
} 