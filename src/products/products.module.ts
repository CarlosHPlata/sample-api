import { Module } from '@nestjs/common';
import { InMemoryProductsRepository } from './in-memory-products.repository';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    // The one line to change when products move to a real database.
    { provide: ProductsRepository, useClass: InMemoryProductsRepository },
  ],
})
export class ProductsModule {}
