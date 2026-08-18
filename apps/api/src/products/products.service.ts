import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(input: CreateProductInput) {
    return this.prisma.product.create({
      data: {
        name: input.name,
        price: input.price,
        description: input.description || null,
      },
    });
  }
}
