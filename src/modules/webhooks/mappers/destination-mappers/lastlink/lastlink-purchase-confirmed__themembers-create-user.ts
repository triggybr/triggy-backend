import { Injectable } from "@nestjs/common";
import { DestinationMapper, MapperResponse } from "../../../contracts/destination-mapper.interface";
import { Logger } from "@nestjs/common";
import { UserIntegration } from "../../../../integrations/schemas/user-integration.schema";

@Injectable()
export class LastlinkPurchaseConfirmedToThemembersCreateUserMapper implements DestinationMapper {
  private readonly KEY = 'lastlink:purchase.confirmed__themembers:create.user';
  private readonly url = 'https://registration.themembers.dev.br/api/users/create';

  private readonly logger = new Logger(LastlinkPurchaseConfirmedToThemembersCreateUserMapper.name);

  key(): string {
    return this.KEY;
  }

  supports(sourcePlatform: string, sourceEvent: string, destPlatform: string, destAction: string): boolean {
    return sourcePlatform === 'lastlink' && sourceEvent === 'purchase.confirmed' && destPlatform === 'themembers' && destAction === 'create.user';
  }

  async mapAndDispatch(payload: any, integration: UserIntegration): Promise<MapperResponse> {
    const data = payload?.data ?? payload ?? {};

    const buyer = data.Data.Buyer;
    const lastlinkProducts = data.Data.Products;

    const theMembersProductIdField = integration.destination.additionalFields?.find((field) => field.name === 'productId')
    const theMemebersProductId = theMembersProductIdField?.value as string;

    const theMembersProductIds: string[] = [theMemebersProductId];

    lastlinkProducts?.forEach((product) => {
      if (integration.orderBump?.[product.Id]) {
        theMembersProductIds.push(integration.orderBump?.[product.Id]);
      }
    });

    const createUserData = {
      product_id: theMembersProductIds,
      users: [{
        name: buyer.Name,
        last_name: " ",
        email: buyer.Email,
        document: buyer.Document,
        phone: buyer.PhoneNumber,
        reference_id: buyer.Id,
        accession_date: data.CreatedAt.split('T')[0],
      }]
    };

    const developerTokenField = integration.destination.additionalFields?.find((field) => field.name === 'developerToken')
    const developerToken = developerTokenField?.value;

    const platformTokenField = integration.destination.additionalFields?.find((field) => field.name === 'platformToken')
    const platformToken = platformTokenField?.value;

    const url = `${this.url}/${developerToken}/${platformToken}`;

    const now = new Date()
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createUserData),
    });

    const responseStatus = res.status;
    const responseTime = new Date().getTime() - now.getTime();

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Themembers API error: ${res.status} - ${text}`);
    }

    return { responseStatus, mappedPayload: createUserData, responseTime };
  }
}