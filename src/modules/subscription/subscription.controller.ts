import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { BillingHistoryQueryDto } from './dto/billing-history-query.dto';
import { UpgradeOptionsQueryDto } from './dto/upgrade-options-query.dto';
import { BillingHistoryResponseDto, UpgradeOptionsResponseDto } from './dto/subscription-responses.dto';
import { ActiveUserExternalId } from 'src/common/decorators/active-user-id.decorator';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
    private logger = new Logger(SubscriptionController.name);

    constructor(private readonly subscriptionService: SubscriptionService) { }

    @Get('billing-history')
    @ApiOperation({ summary: 'Histórico de cobrança' })
    @ApiResponse({
        status: 200,
        description: 'Histórico de cobrança retornado com sucesso',
        type: BillingHistoryResponseDto,
    })
    async getBillingHistory(
        @ActiveUserExternalId() externalId: string,
        @Query() query: BillingHistoryQueryDto,
    ): Promise<BillingHistoryResponseDto> {
        try {
            return await this.subscriptionService.getBillingHistory(externalId, query);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    @Get('upgrade-options')
    @ApiOperation({ summary: 'Opções de upgrade disponíveis' })
    @ApiResponse({
        status: 200,
        description: 'Opções de upgrade retornadas com sucesso',
        type: UpgradeOptionsResponseDto,
    })
    async getUpgradeOptions(
        @ActiveUserExternalId() userId: string,
        @Query() query: UpgradeOptionsQueryDto,
    ): Promise<UpgradeOptionsResponseDto> {
        try {
            return await this.subscriptionService.getUpgradeOptions(userId, query);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}

