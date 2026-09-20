import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/** Same rules as creation, every field optional: send only what changes. */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
