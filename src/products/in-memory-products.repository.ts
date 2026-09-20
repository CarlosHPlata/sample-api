import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';
import { ProductsRepository } from './products.repository';

/** Adapter: keeps products in process memory. Data is lost on restart. */
@Injectable()
export class InMemoryProductsRepository extends ProductsRepository {
  private readonly products = new Map<string, Product>();

  async findAll(): Promise<Product[]> {
    return [...this.products.values()].map((product) => ({ ...product }));
  }

  async findById(id: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    return product ? { ...product } : undefined;
  }

  async save(product: Product): Promise<Product> {
    this.products.set(product.id, { ...product });
    return { ...product };
  }

  async delete(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
}
