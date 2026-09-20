import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const ID = 'a3c1f6de-1111-4222-8333-444455556666';
const product = { id: ID, name: 'Keyboard', description: 'TKL', price: 89.9 };

describe('ProductsController', () => {
  let controller: ProductsController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();
    controller = moduleRef.get(ProductsController);
  });

  it('lists what the service returns', async () => {
    service.findAll.mockResolvedValue([product]);

    expect(await controller.listProducts()).toEqual([product]);
  });

  it('gets one product by id', async () => {
    service.findOne.mockResolvedValue(product);

    expect(await controller.getProduct(ID)).toEqual(product);
    expect(service.findOne).toHaveBeenCalledWith(ID);
  });

  it('creates from the request body', async () => {
    const dto = { name: 'Keyboard', description: 'TKL', price: 89.9 };
    service.create.mockResolvedValue(product);

    expect(await controller.createProduct(dto)).toEqual(product);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('updates the product named in the path with the body', async () => {
    service.update.mockResolvedValue({ ...product, price: 10 });

    expect(await controller.updateProduct(ID, { price: 10 })).toEqual({ ...product, price: 10 });
    expect(service.update).toHaveBeenCalledWith(ID, { price: 10 });
  });

  it('deletes the product named in the path', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.deleteProduct(ID);

    expect(service.remove).toHaveBeenCalledWith(ID);
  });
});
