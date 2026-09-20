import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.config';

const keyboard = { name: 'Keyboard', description: 'Tenkeyless', price: 89.9 };
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('HTTP API', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health → 200 ok', async () => {
    const response = await http().get('/health').expect(200);

    expect(response.body.status).toBe('ok');
  });

  it('walks a product through create → list → update → delete', async () => {
    const created = (await http().post('/products').send(keyboard).expect(201)).body;
    expect(created).toEqual({ id: expect.any(String), ...keyboard });

    expect((await http().get('/products').expect(200)).body).toEqual([created]);

    const updated = (await http().patch(`/products/${created.id}`).send({ price: 79.5 }).expect(200)).body;
    expect(updated).toEqual({ ...created, price: 79.5 });

    await http().delete(`/products/${created.id}`).expect(204);
    await http().get(`/products/${created.id}`).expect(404);
  });

  it('POST /products → 400 when the body breaks the rules', async () => {
    await http().post('/products').send({ ...keyboard, price: -1 }).expect(400);
    await http().post('/products').send({ name: 'only a name' }).expect(400);
  });

  it('POST /products → 400 when the body carries unknown fields', async () => {
    await http().post('/products').send({ ...keyboard, stock: 3 }).expect(400);
  });

  it('→ 400 for an id that is not a UUID, 404 for one that does not exist', async () => {
    await http().get('/products/not-a-uuid').expect(400);
    await http().get(`/products/${UNKNOWN_ID}`).expect(404);
    await http().patch(`/products/${UNKNOWN_ID}`).send({ price: 1 }).expect(404);
    await http().delete(`/products/${UNKNOWN_ID}`).expect(404);
  });
});
