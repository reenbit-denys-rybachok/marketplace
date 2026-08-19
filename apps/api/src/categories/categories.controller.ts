import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateCategoryInput, createCategorySchema } from './category.schema';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createCategorySchema))
    input: CreateCategoryInput,
  ) {
    return this.categoriesService.create(input);
  }
}
