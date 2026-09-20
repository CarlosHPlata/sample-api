import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({ format: 'uuid', example: '3f1c2a9e-6b1d-4c55-9a59-0e8d1c1f7a10' })
  id: string;

  @ApiProperty({ example: 'Mechanical keyboard' })
  name: string;

  @ApiProperty({ example: 'Tenkeyless, brown switches, USB-C' })
  description: string;

  @ApiProperty({ example: 89.9, minimum: 0, description: 'Unit price, at most two decimals' })
  price: number;
}
