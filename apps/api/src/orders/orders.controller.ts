import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateOrderInput, createOrderSchema } from './order.schema';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post()
  create(@Body(new ZodValidationPipe(createOrderSchema)) input: CreateOrderInput) {
    return this.ordersService.create(input);
  }
}
