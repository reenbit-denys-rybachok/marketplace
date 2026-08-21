import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(input: CreateOrderInput) {
    const quantitiesByProductId = input.items.reduce<Record<string, number>>(
      (quantities, item) => {
        quantities[item.productId] = (quantities[item.productId] ?? 0) + item.quantity;
        return quantities;
      },
      {},
    );
    const productIds = Object.keys(quantitiesByProductId);

    return this.prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('Some products were not found');
      }

      let total = new Prisma.Decimal(0);

      const orderItems = products.map((product) => {
        const quantity = quantitiesByProductId[product.id];

        if (product.stock < quantity) {
          throw new BadRequestException(`${product.name} does not have enough stock`);
        }

        const unitPrice = new Prisma.Decimal(product.price);
        total = total.plus(unitPrice.mul(quantity));

        return {
          productId: product.id,
          quantity,
          unitPrice,
        };
      });

      await Promise.all(
        orderItems.map((item) =>
          transaction.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      );

      return transaction.order.create({
        data: {
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }
}
