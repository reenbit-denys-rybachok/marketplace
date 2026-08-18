import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateProductInput, createProductSchema } from './product.schema';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createProductSchema))
    input: CreateProductInput,
  ) {
    return this.productsService.create(input);
  }
}
