import { Injectable, Logger } from '@nestjs/common';
import { DestinationMapper, MapperResponse } from '../../contracts/destination-mapper.interface';
import { UserIntegration } from '../../../integrations/schemas/user-integration.schema';

@Injectable()
export class LastlinkAbandonedCartToHotzappCreateProductMapper implements DestinationMapper {
  private readonly KEY = 'lastlink:abandoned.cart__hotzapp:create.product';

  private readonly logger = new Logger(LastlinkAbandonedCartToHotzappCreateProductMapper.name);

  key(): string {
    return this.KEY;
  }

  supports(sourcePlatform: string, sourceEvent: string, destPlatform: string, destAction: string): boolean {
    return sourcePlatform === 'lastlink' && sourceEvent === 'abandoned.cart' && destPlatform === 'hotzapp' && destAction === 'create.product';
  }

  async mapAndDispatch(payload: any, integration: UserIntegration): Promise<MapperResponse> {
    const data = payload?.data ?? payload ?? {};

    const buyer = data.Data.Buyer;
    const offer = data.Data.Offer;
    const products = data.Data.Products;
    const lineItems = products?.map((product) => ({
      product_name: product.Name,
      quantity: 1,
      price: 0.00,
    }))

    const productData = {
      created_at: data.CreatedAt,
      name: buyer.Name,
      phone: buyer.Phone,
      email: buyer.Email,
      abandoned_checkout_url: offer.Url,
      line_items: lineItems,
    };

    const { url, apiKey } = integration.destination || {};
    if (!url || !apiKey) {
      throw new Error('Missing destination URL or API key for Hotzapp');
    }

    const now = new Date()
    const res = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(productData),
    });

    const responseStatus = res.status;
    const responseTime = new Date().getTime() - now.getTime();

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Hotzapp API error: ${res.status} - ${text}`);
    }

    const responseBody = await res.json().catch(() => ({}));
    return { responseStatus, responseBody, responseTime };
  }
}
