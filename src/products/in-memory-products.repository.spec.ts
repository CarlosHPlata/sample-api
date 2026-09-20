import { InMemoryProductsRepository } from './in-memory-products.repository';

const product = { id: 'a3c1f6de-1111-4222-8333-444455556666', name: 'Keyboard', description: 'TKL', price: 89.9 };

describe('InMemoryProductsRepository', () => {
  let repository: InMemoryProductsRepository;

  beforeEach(() => {
    repository = new InMemoryProductsRepository();
  });

  it('returns undefined for an id it does not hold', async () => {
    expect(await repository.findById(product.id)).toBeUndefined();
  });

  it('replaces the stored product when saving the same id again', async () => {
    await repository.save(product);
    await repository.save({ ...product, price: 50 });

    expect(await repository.findAll()).toEqual([{ ...product, price: 50 }]);
  });

  it('hands out copies, so callers cannot mutate what is stored', async () => {
    await repository.save(product);

    const found = await repository.findById(product.id);
    found!.name = 'mutated outside';

    expect((await repository.findById(product.id))!.name).toBe('Keyboard');
  });

  it('tells whether delete removed something', async () => {
    await repository.save(product);

    expect(await repository.delete(product.id)).toBe(true);
    expect(await repository.delete(product.id)).toBe(false);
  });
});
