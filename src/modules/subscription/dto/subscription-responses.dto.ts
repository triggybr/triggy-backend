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

    @ApiProperty({ example: 'R$ 89,90' })
    amount: string;

    @ApiProperty({ example: 89.90 })
    amountValue: number;

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

    @ApiProperty({ example: 'R$ 89,90' })
    amount: string;

    @ApiProperty({ example: 89.90 })
    amountValue: number;

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

    @ApiProperty({ example: 'R$ 359,60' })
    totalPaid: string;

    @ApiProperty({ example: 359.60 })
    totalPaidValue: number;

    @ApiProperty({ example: 'R$ 71,92' })
    averageMonthly: string;

    @ApiProperty({ example: 71.92 })
    averageMonthlyValue: number;
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

    @ApiProperty({ example: 'R$ 49,90' })
    price: string;
}

class UpgradeOptionDto {
    @ApiProperty({ example: 'ouro' })
    id: string;

    @ApiProperty({ example: 'Ouro' })
    planName: string;

    @ApiProperty({ example: 'R$ 49,90' })
    currentPrice: string;

    @ApiProperty({ example: 'R$ 89,90' })
    upgradePrice: string;

    @ApiProperty({ example: 'R$ 40,00 a mais por mês' })
    savings: string;

    @ApiProperty({ example: 40.00 })
    monthlySavings: number;

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
    recommended: boolean;

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

