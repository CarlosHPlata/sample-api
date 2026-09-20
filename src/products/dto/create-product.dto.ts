import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Mechanical keyboard', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'Tenkeyless, brown switches, USB-C', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: 89.9, minimum: 0, description: 'Unit price, at most two decimals' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}
