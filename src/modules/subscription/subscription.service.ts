import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../checkout/schemas/order.schema';
import { Plan, PlanDocument } from '../plans/schemas/plan.schema';
import { Signature, SignatureDocument } from '../user/schemas/signature.schema';
import { BillingHistoryQueryDto } from './dto/billing-history-query.dto';
import { BillingHistoryResponseDto, UpgradeOptionsResponseDto } from './dto/subscription-responses.dto';
import { UpgradeOptionsQueryDto } from './dto/upgrade-options-query.dto';

@Injectable()
export class SubscriptionService {
    private logger = new Logger(SubscriptionService.name);

    constructor(
        @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
        @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
        @InjectModel(Signature.name) private readonly signatureModel: Model<SignatureDocument>,
    ) { }

    async getBillingHistory(userId: string, query: BillingHistoryQueryDto): Promise<BillingHistoryResponseDto> {
        const { limit = 10, offset = 0, status, startDate, endDate } = query;

        // Build query filter
        const filter: any = { userId };

        // Map status filter
        if (status && status !== 'all') {
            const statusMap = {
                paid: 'APPROVED',
                pending: 'PENDING',
                failed: 'REJECTED',
                cancelled: 'REFUNDED',
            };
            filter.status = statusMap[status];
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = startDate;
            }
            if (endDate) {
                // Include the entire end date
                filter.createdAt.$lte = `${endDate}T23:59:59.999Z`;
            }
        }

        // Get total count
        const total = await this.orderModel.countDocuments(filter);

        // Get orders (invoices)
        const orders = await this.orderModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset)
            .lean();

        // Get user signature for upcoming invoice
        const signature = await this.signatureModel
            .findOne({ userId, active: true })
            .lean();

        // Get plan information
        const planIds = [...new Set(orders.map(o => {
            // We need to get plan info from signature or deduce it
            return signature?.planId;
        }).filter(Boolean))];

        const plans = await this.planModel.find({ id: { $in: planIds } }).lean();
        const planMap = new Map(plans.map(p => [p.id, p]));

        // Get current plan for signature
        let currentPlan: any = null;
        if (signature) {
            currentPlan = planMap.get(signature.planId) || await this.planModel.findOne({ id: signature.planId }).lean();
        }

        // Format invoices
        const invoices = orders.map(order => {
            const plan = currentPlan; // Assuming all orders use current plan
            const createdDate = new Date(order.createdAt);
            const dueDate = new Date(createdDate);
            dueDate.setDate(dueDate.getDate() + 1); // Due date is next day

            // Calculate period (monthly subscription)
            const periodStart = new Date(createdDate);
            const periodEnd = new Date(createdDate);
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            // Map status
            const statusMap: Record<string, string> = {
                APPROVED: 'paid',
                PENDING: 'pending',
                REJECTED: 'failed',
                REFUNDED: 'cancelled',
            };

            const finalAmount = order.priceValue - (order.discountValue || 0);

            return {
                id: order.id,
                invoiceNumber: `INV-${order.id.substring(0, 8).toUpperCase()}`,
                date: createdDate.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                amount: finalAmount,
                currency: 'BRL',
                status: statusMap[order.status] || 'pending',
                planName: plan?.name || signature?.type || 'Unknown',
                period: {
                    start: periodStart.toISOString().split('T')[0],
                    end: periodEnd.toISOString().split('T')[0],
                },
                paymentMethod: order.paymentMethod === 'CARD' ? {
                    type: 'card',
                    last4: signature?.last4,
                    brand: 'Visa', // Default, could be enhanced
                } : undefined,
                paidAt: order.approvedAt || undefined,
                invoiceUrl: undefined,
                downloadUrl: undefined,
            };
        });

        // Build upcoming invoice if signature exists and is active
        let upcomingInvoice: any = undefined;
        if (signature && signature.active && signature.nextBillingDate && currentPlan) {
            const nextBillingDate = new Date(signature.nextBillingDate);
            const periodStart = new Date(nextBillingDate);
            const periodEnd = new Date(nextBillingDate);
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            upcomingInvoice = {
                id: `upcoming_${signature.id}`,
                date: nextBillingDate.toISOString().split('T')[0],
                amount: currentPlan.priceValue,
                currency: 'BRL',
                planName: currentPlan.name,
                period: {
                    start: periodStart.toISOString().split('T')[0],
                    end: periodEnd.toISOString().split('T')[0],
                },
                status: 'upcoming',
                autoRenewal: signature.active,
            };
        }

        // Calculate stats
        const paidOrders = orders.filter(o => o.status === 'APPROVED');
        const totalPaidValue = paidOrders.reduce((sum, order) => {
            return sum + (order.priceValue - (order.discountValue || 0));
        }, 0);
        const averageMonthlyValue = paidOrders.length > 0 ? totalPaidValue / paidOrders.length : 0;

        const stats = {
            totalInvoices: paidOrders.length,
            totalPaid: totalPaidValue,
            averageMonthly: Math.round(averageMonthlyValue),
        };

        const pagination = {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        };

        return {
            invoices,
            upcomingInvoice,
            stats,
            pagination,
        };
    }

    async getUpgradeOptions(userId: string, query: UpgradeOptionsQueryDto): Promise<UpgradeOptionsResponseDto> {
        const { includeFeatureComparison = false } = query;

        // Get user's current signature
        const signature = await this.signatureModel
            .findOne({ userId, active: true })
            .lean();

        // Get all plans sorted by price
        const plans = await this.planModel
            .find()
            .sort({ priceValue: 1 })
            .lean();

        let currentPlan: any = null;
        let currentPlanPrice = 0;

        if (signature) {
            currentPlan = plans.find(p => p.id === signature.planId);
            if (currentPlan) {
                currentPlanPrice = currentPlan.priceValue;
            }
        }

        // Filter upgrade options (plans more expensive than current)
        const upgradeOptions = plans
            .filter(plan => plan.priceValue > currentPlanPrice)
            .map((plan, index) => {
                const priceDifference = plan.priceValue - currentPlanPrice;
                const isRecommended = index === 0; // First upgrade option is recommended

                // Compare features with current plan
                const currentFeatures = currentPlan?.features || [];
                const newFeatures = plan.features.filter((f: string) => !currentFeatures.includes(f));

                // Build feature comparison strings
                const features: string[] = [];

                // Add integration comparison if available
                if (plan.integrationQuota && currentPlan?.integrationQuota) {
                    features.push(`Até ${plan.integrationQuota} integrações (vs ${currentPlan.integrationQuota} atual)`);
                } else if (plan.integrationQuota) {
                    features.push(`Até ${plan.integrationQuota} integrações`);
                }

                // Add webhook quota comparison if available
                if (plan.webhookQuota && currentPlan?.webhookQuota) {
                    features.push(`${plan.webhookQuota.toLocaleString('pt-BR')} webhooks/mês (vs ${currentPlan.webhookQuota.toLocaleString('pt-BR')} atual)`);
                } else if (plan.webhookQuota) {
                    features.push(`${plan.webhookQuota.toLocaleString('pt-BR')} webhooks/mês`);
                }

                return {
                    id: plan.id,
                    planName: plan.name,
                    currentPrice: currentPlanPrice,
                    upgradePrice: plan.priceValue,
                    priceDifference: priceDifference,
                    features,
                    newFeatures,
                    popular: plan.popular,
                    billingCycle: 'monthly' as const,
                };
            });

        const hasUpgradeOptions = upgradeOptions.length > 0;
        const isTopTier = !hasUpgradeOptions && currentPlan !== null;

        // Build feature comparison if requested
        let featureComparison: any = undefined;
        if (includeFeatureComparison && upgradeOptions.length > 0) {
            const targetPlan = plans.find(p => p.id === upgradeOptions[0].id);

            if (targetPlan && currentPlan) {
                const allFeatures = [...new Set([...currentPlan.features, ...targetPlan.features])];

                featureComparison = allFeatures.map(feature => ({
                    feature,
                    currentPlan: currentPlan.features.includes(feature),
                    targetPlan: targetPlan.features.includes(feature),
                    highlighted: !currentPlan.features.includes(feature) && targetPlan.features.includes(feature),
                }));
            }
        }

        return {
            hasUpgradeOptions,
            isTopTier,
            currentPlan: currentPlan ? {
                id: currentPlan.id,
                name: currentPlan.name,
                price: currentPlan.priceValue,
            } : {
                id: 'none',
                name: 'Nenhum plano',
                price: 0,
            },
            upgradeOptions,
            featureComparison,
        };
    }
}

