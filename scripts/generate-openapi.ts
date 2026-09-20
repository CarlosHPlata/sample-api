/* eslint-disable no-console */
/**
 * Writes ./openapi.yml from the code, without starting an HTTP server.
 *
 *   npm run openapi:generate
 *
 * The app is built in-process only to read its routes and DTOs; nothing listens
 * on a port and no external service is needed, so this runs anywhere `npm ci` ran.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { dump } from 'js-yaml';
import { AppModule } from '../src/app.module';
import { buildOpenApiDocument } from '../src/openapi';

const TARGET = resolve(__dirname, '..', 'openapi.yml');

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = buildOpenApiDocument(app);
  await app.close();

  const yaml = dump(document, { noRefs: true, lineWidth: 120 });
  writeFileSync(TARGET, yaml, 'utf8');

  const operations = Object.values(document.paths).reduce((count, path) => count + Object.keys(path).length, 0);
  console.log(`openapi.yml written: ${Object.keys(document.paths).length} paths, ${operations} operations`);
}

main().catch((error) => {
  console.error('openapi:generate failed:', error);
  process.exit(1);
});
