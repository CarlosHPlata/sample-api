import { Product } from './product.entity';

/**
 * Port: what the application needs from a product store, and nothing about how
 * it is stored. The abstract class doubles as the Nest injection token, so the
 * adapter is chosen in one place (products.module.ts).
 */
export abstract class ProductsRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | undefined>;
  /** Inserts or replaces the product with that id. */
  abstract save(product: Product): Promise<Product>;
  /** Resolves to false when there was nothing to delete. */
  abstract delete(id: string): Promise<boolean>;
}
