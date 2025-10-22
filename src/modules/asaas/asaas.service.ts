import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AsaasCreateCustomerInput } from './dto/create-customer.dto';
import { AsaasCreateSubscriptionWithCreditCardInput } from './dto/create-subscription-credit-card.dto';
import { AsaasUpdateSubscriptionInput } from './dto/update-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AsaasService {
  private ASAAS_API_KEY = process.env.ASAAS_API_KEY

  constructor(
    private readonly http: HttpService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) { }

  private get authHeaders() {
    if (!this.ASAAS_API_KEY) throw new InternalServerErrorException('ASAAS_API_KEY ausente');
    return { access_token: this.ASAAS_API_KEY };
  }

  async createCustomer(input: AsaasCreateCustomerInput) {
    const { data } = await firstValueFrom(
      this.http.post('/customers', input, { headers: this.authHeaders }),
    );
    return data;
  }

  async createSubscriptionWithCreditCard(userExternalId: string, input: AsaasCreateSubscriptionWithCreditCardInput) {
    try {

      const user = await this.userModel.findOne({ externalId: userExternalId }).lean();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let customerId = user.gatewayId;

      if (!customerId) {
        const customerData: AsaasCreateCustomerInput = {
          name: input.creditCardHolderInfo.name,
          cpfCnpj: input.creditCardHolderInfo.cpfCnpj,
        };

        const customer = await this.createCustomer(customerData);
        customerId = customer.id;

        if (!customerId) {
          throw new InternalServerErrorException('Failed to create customer in gateway');
        }

        await this.userModel.updateOne(
          { id: user.id },
          { gatewayId: customerId }
        );
      }

      const nextDueDate = new Date().toISOString().split('T')[0];

      const finalValue = parseFloat((input.value / 100).toFixed(2))

      const subscriptionInput = {
        customer: customerId,
        externalReference: input.externalReference,
        billingType: 'CREDIT_CARD',
        value: finalValue,
        nextDueDate,
        cycle: 'MONTHLY',
        creditCard: input.creditCard,
        creditCardHolderInfo: input.creditCardHolderInfo,
        remoteIp: input.remoteIp
      };

      const { data } = await firstValueFrom(
        this.http.post('/subscriptions', subscriptionInput, { headers: this.authHeaders }),
      );

      return data;
    } catch (error) {
      throw error
    }



  }

  async updateSubscription(input: AsaasUpdateSubscriptionInput) {
    const finalValue = parseFloat((input.value / 100).toFixed(2));
    const status = input.status || 'ACTIVE';

    const { data } = await firstValueFrom(
      this.http.put(`/subscriptions/${input.id}`, { value: finalValue, status }, { headers: this.authHeaders })
    );
    return data;
  }

  async deleteSubscription(id: string) {
    const { data } = await firstValueFrom(
      this.http.delete(`/subscriptions/${id}`, { headers: this.authHeaders })
    );
    return data;
  }
} 