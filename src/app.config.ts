import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * HTTP behaviour shared by the real server (main.ts) and the end-to-end tests,
 * so the tests exercise exactly what production runs.
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // drop properties the DTO does not declare…
      forbidNonWhitelisted: true, // …and reject the request if there were any
      transform: true,
    }),
  );
}
