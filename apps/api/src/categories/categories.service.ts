import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryInput } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  create(input: CreateCategoryInput) {
    return this.prisma.category.create({
      data: {
        name: input.name,
      },
    });
  }
}
