import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List every product' })
  @ApiOkResponse({ type: Product, isArray: true })
  listProducts(): Promise<Product[]> {
    return this.products.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one product' })
  @ApiOkResponse({ type: Product })
  @ApiBadRequestResponse({ description: 'id is not a UUID' })
  @ApiNotFoundResponse({ description: 'No product with that id' })
  getProduct(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.products.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiCreatedResponse({ type: Product })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  createProduct(@Body() dto: CreateProductDto): Promise<Product> {
    return this.products.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product: send only the fields that change' })
  @ApiOkResponse({ type: Product })
  @ApiBadRequestResponse({ description: 'Validation failed, or id is not a UUID' })
  @ApiNotFoundResponse({ description: 'No product with that id' })
  updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiBadRequestResponse({ description: 'id is not a UUID' })
  @ApiNotFoundResponse({ description: 'No product with that id' })
  deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.products.remove(id);
  }
}
