import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Test } from '@nestjs/testing';
import { load } from 'js-yaml';
import { AppModule } from '../src/app.module';
import { buildOpenApiDocument } from '../src/openapi';

type Contract = { info: { version?: string } } & Record<string, unknown>;

/** The version is stamped at release time, so it is not part of the comparison. */
function withoutVersion(contract: Contract): Contract {
  const copy: Contract = JSON.parse(JSON.stringify(contract));
  delete copy.info.version;
  return copy;
}

describe('openapi.yml', () => {
  it('matches the API the code exposes (run `npm run openapi:generate` after changing an endpoint)', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    const fromCode = buildOpenApiDocument(app) as unknown as Contract;
    await app.close();

    const committed = load(readFileSync(resolve(__dirname, '..', 'openapi.yml'), 'utf8')) as Contract;

    expect(withoutVersion(committed)).toEqual(withoutVersion(fromCode));
  });
});
