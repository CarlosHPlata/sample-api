import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

const valid = { name: 'Keyboard', description: 'Tenkeyless', price: 89.9 };

async function failingFields(input: Record<string, unknown>): Promise<string[]> {
  const errors = await validate(plainToInstance(CreateProductDto, input));
  return errors.map((error) => error.property).sort();
}

describe('CreateProductDto', () => {
  it('accepts a complete, well-formed product', async () => {
    expect(await failingFields(valid)).toEqual([]);
  });

  it('accepts a free product and an empty description', async () => {
    expect(await failingFields({ ...valid, description: '', price: 0 })).toEqual([]);
  });

  it.each([
    ['an empty name', { ...valid, name: '' }, ['name']],
    ['a name over 120 characters', { ...valid, name: 'x'.repeat(121) }, ['name']],
    ['a negative price', { ...valid, price: -0.01 }, ['price']],
    ['a price with three decimals', { ...valid, price: 1.999 }, ['price']],
    ['a price sent as text', { ...valid, price: '89.9' }, ['price']],
    ['missing fields', {}, ['description', 'name', 'price']],
  ])('rejects %s', async (_case, input, expected) => {
    expect(await failingFields(input)).toEqual(expected);
  });
});
