import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly products: ProductsRepository) {}

  findAll(): Promise<Product[]> {
    return this.products.findAll();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  create(dto: CreateProductDto): Promise<Product> {
    return this.products.save({
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      price: dto.price,
    });
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const current = await this.findOne(id);
    // A field that is absent from the patch must not erase the stored value.
    const changes = Object.fromEntries(Object.entries(dto).filter(([, value]) => value !== undefined));
    return this.products.save({ ...current, ...changes, id });
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.products.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }
}
