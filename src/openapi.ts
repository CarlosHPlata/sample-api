import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

/**
 * Single source of the OpenAPI document. Used by the Swagger UI (main.ts),
 * by `npm run openapi:generate`, and by the contract test.
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Inventory API')
    .setDescription('Create, update, delete and list the products of an inventory.')
    .setVersion(process.env.APP_VERSION ?? '0.0.0')
    .build();

  return SwaggerModule.createDocument(app, config, {
    // operationId = controller method name: `listProducts`, not `ProductsController_listProducts`.
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
  });
}
