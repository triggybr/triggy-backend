import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from './schemas/plan.schema';

@Injectable()
export class PlansService {
  constructor(@InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>) {}

  async getPlans(includeFeatures: boolean) {
    const docs = await this.planModel.find().sort({ priceValue: 1 }).lean();
    const plans = docs.map((document) => ({
      id: document.id,
      name: document.name,
      priceValue: document.priceValue,
      icon: document.icon,
      description: document.description,
      features: includeFeatures ? document.features : undefined,
      popular: document.popular,
    }));
    return { plans };
  }
} 