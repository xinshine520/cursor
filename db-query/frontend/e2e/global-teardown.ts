import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Optional: Cleanup test environment
  // For example, cleanup test data, stop services, etc.
  console.log('🧹 Test teardown complete');
}

export default globalTeardown;
