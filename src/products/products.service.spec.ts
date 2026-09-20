import { NotFoundException } from '@nestjs/common';
import { InMemoryProductsRepository } from './in-memory-products.repository';
import { ProductsService } from './products.service';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';
const keyboard = { name: 'Keyboard', description: 'Tenkeyless', price: 89.9 };
const mouse = { name: 'Mouse', description: 'Wireless', price: 25 };

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    // The in-memory adapter is fast and deterministic, so the service is tested
    // against the real thing instead of a mock of the repository.
    service = new ProductsService(new InMemoryProductsRepository());
  });

  describe('create', () => {
    it('stores the product and gives it a generated id', async () => {
      const created = await service.create(keyboard);

      expect(created).toEqual({ id: expect.any(String), ...keyboard });
      expect(await service.findOne(created.id)).toEqual(created);
    });

    it('gives every product a different id', async () => {
      const first = await service.create(keyboard);
      const second = await service.create(keyboard);

      expect(first.id).not.toBe(second.id);
    });
  });

  describe('findAll', () => {
    it('is empty when nothing was created', async () => {
      expect(await service.findAll()).toEqual([]);
    });

    it('lists every product that was created', async () => {
      const a = await service.create(keyboard);
      const b = await service.create(mouse);

      expect(await service.findAll()).toEqual([a, b]);
    });
  });

  describe('findOne', () => {
    it('rejects with NotFoundException for an unknown id', async () => {
      await expect(service.findOne(UNKNOWN_ID)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('changes only the fields present in the patch', async () => {
      const created = await service.create(keyboard);

      const updated = await service.update(created.id, { price: 79.5 });

      expect(updated).toEqual({ ...created, price: 79.5 });
      expect(await service.findOne(created.id)).toEqual(updated);
    });

    it('ignores fields that are present but undefined', async () => {
      const created = await service.create(keyboard);

      const updated = await service.update(created.id, { name: undefined, price: 10 });

      expect(updated.name).toBe('Keyboard');
      expect(updated.price).toBe(10);
    });

    it('never lets a patch change the id', async () => {
      const created = await service.create(keyboard);

      const updated = await service.update(created.id, { id: UNKNOWN_ID, name: 'Renamed' } as never);

      expect(updated.id).toBe(created.id);
      await expect(service.findOne(UNKNOWN_ID)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects with NotFoundException for an unknown id', async () => {
      await expect(service.update(UNKNOWN_ID, { price: 1 })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the product', async () => {
      const created = await service.create(keyboard);

      await service.remove(created.id);

      expect(await service.findAll()).toEqual([]);
    });

    it('rejects with NotFoundException for an unknown id', async () => {
      await expect(service.remove(UNKNOWN_ID)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
