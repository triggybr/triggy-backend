import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class InvoicePaymentMethodDto {
    @ApiProperty({ enum: ['card', 'pix', 'boleto'], example: 'card' })
    type: string;

    @ApiPropertyOptional({ example: '1234' })
    last4?: string;

    @ApiPropertyOptional({ example: 'Visa' })
    brand?: string;
}

class InvoicePeriodDto {
    @ApiProperty({ example: '2024-01-21' })
    start: string;

    @ApiProperty({ example: '2024-02-21' })
    end: string;
}

class InvoiceDto {
    @ApiProperty({ example: 'inv_2024_01' })
    id: string;

    @ApiProperty({ example: 'INV-2024-0001' })
    invoiceNumber: string;

    @ApiProperty({ example: '2024-01-21' })
    date: string;

    @ApiProperty({ example: '2024-01-21' })
    dueDate: string;

    @ApiProperty({ example: 8990, description: 'Valor em centavos' })
    amount: number;

    @ApiProperty({ example: 'BRL' })
    currency: string;

    @ApiProperty({ enum: ['paid', 'pending', 'failed', 'cancelled'], example: 'paid' })
    status: string;

    @ApiProperty({ example: 'Ouro' })
    planName: string;

    @ApiProperty({ type: InvoicePeriodDto })
    period: InvoicePeriodDto;

    @ApiPropertyOptional({ type: InvoicePaymentMethodDto })
    paymentMethod?: InvoicePaymentMethodDto;

    @ApiPropertyOptional({ example: '2024-01-21T10:30:00Z' })
    paidAt?: string;

    @ApiPropertyOptional({ example: 'https://api.triggy.app/invoices/inv_2024_01.pdf' })
    invoiceUrl?: string;

    @ApiPropertyOptional({ example: 'https://api.triggy.app/invoices/inv_2024_01.pdf' })
    downloadUrl?: string;
}

class UpcomingInvoiceDto {
    @ApiProperty({ example: 'inv_upcoming_2024_02' })
    id: string;

    @ApiProperty({ example: '2024-02-21' })
    date: string;

    @ApiProperty({ example: 8990, description: 'Valor em centavos' })
    amount: number;

    @ApiProperty({ example: 'BRL' })
    currency: string;

    @ApiProperty({ example: 'Ouro' })
    planName: string;

    @ApiProperty({ type: InvoicePeriodDto })
    period: InvoicePeriodDto;

    @ApiProperty({ enum: ['upcoming', 'processing'], example: 'upcoming' })
    status: string;

    @ApiProperty({ example: true })
    autoRenewal: boolean;
}

class BillingStatsDto {
    @ApiProperty({ example: 5 })
    totalInvoices: number;

    @ApiProperty({ example: 35960, description: 'Valor total pago em centavos' })
    totalPaid: number;

    @ApiProperty({ example: 7192, description: 'Média mensal em centavos' })
    averageMonthly: number;
}

class BillingPaginationDto {
    @ApiProperty({ example: 5 })
    total: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 0 })
    offset: number;

    @ApiProperty({ example: false })
    hasMore: boolean;
}

export class BillingHistoryResponseDto {
    @ApiProperty({ type: [InvoiceDto] })
    invoices: InvoiceDto[];

    @ApiPropertyOptional({ type: UpcomingInvoiceDto })
    upcomingInvoice?: UpcomingInvoiceDto;

    @ApiProperty({ type: BillingStatsDto })
    stats: BillingStatsDto;

    @ApiProperty({ type: BillingPaginationDto })
    pagination: BillingPaginationDto;
}

class CurrentPlanDto {
    @ApiProperty({ example: 'prata' })
    id: string;

    @ApiProperty({ example: 'Prata' })
    name: string;

    @ApiProperty({ example: 4990, description: 'Preço em centavos' })
    price: number;
}

class UpgradeOptionDto {
    @ApiProperty({ example: 'ouro' })
    id: string;

    @ApiProperty({ example: 'Ouro' })
    planName: string;

    @ApiProperty({ example: 4990, description: 'Preço atual em centavos' })
    currentPrice: number;

    @ApiProperty({ example: 8990, description: 'Preço do upgrade em centavos' })
    upgradePrice: number;

    @ApiProperty({ example: 4000, description: 'Diferença de preço em centavos' })
    priceDifference: number;

    @ApiProperty({
        type: [String],
        example: ['Até 10 integrações (vs 3 atual)', '5.000 webhooks/mês (vs 1.000 atual)']
    })
    features: string[];

    @ApiProperty({
        type: [String],
        example: ['Transformações customizadas', 'Retry automático']
    })
    newFeatures: string[];

    @ApiProperty({ example: true })
    popular: boolean;

    @ApiProperty({ enum: ['monthly', 'yearly'], example: 'monthly' })
    billingCycle: string;
}

class FeatureComparisonDto {
    @ApiProperty({ example: 'Integrações' })
    feature: string;

    @ApiProperty({ example: true })
    currentPlan: boolean;

    @ApiProperty({ example: true })
    targetPlan: boolean;

    @ApiPropertyOptional({ example: true })
    highlighted?: boolean;
}

export class UpgradeOptionsResponseDto {
    @ApiProperty({ example: true })
    hasUpgradeOptions: boolean;

    @ApiProperty({ example: false })
    isTopTier: boolean;

    @ApiProperty({ type: CurrentPlanDto })
    currentPlan: CurrentPlanDto;

    @ApiProperty({ type: [UpgradeOptionDto] })
    upgradeOptions: UpgradeOptionDto[];

    @ApiPropertyOptional({ type: [FeatureComparisonDto] })
    featureComparison?: FeatureComparisonDto[];
}

