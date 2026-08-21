import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSku(productId: string) {
    return `SKU-${productId.slice(0, 8)}`;
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(input: CreateProductInput) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const id = randomUUID();

      try {
        return await this.prisma.product.create({
          data: {
            id,
            sku: this.generateSku(id),
            name: input.name,
            price: input.price,
            categoryId: input.categoryId,
            imageUrl: input.imageUrl || null,
            description: input.description || null,
          },
          include: {
            category: true,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          Array.isArray(error.meta?.target) &&
          error.meta.target.includes('sku')
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new ConflictException('Could not generate a unique product SKU');
  }
}
