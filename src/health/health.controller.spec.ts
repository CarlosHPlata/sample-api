import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports ok with the process uptime in whole seconds', () => {
    const health = new HealthController().getHealth();

    expect(health.status).toBe('ok');
    expect(Number.isInteger(health.uptime)).toBe(true);
    expect(health.uptime).toBeGreaterThanOrEqual(0);
  });
});
