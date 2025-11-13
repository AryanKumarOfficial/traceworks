/**
 * test/jest-setup.ts
 *
 * Runs after the test environment has been set up.
 * Useful for global timeouts, reflect-metadata, or custom matchers.
 */

import 'reflect-metadata';

// increase default timeout for slow integrations (DB start etc.)
jest.setTimeout(20000);

// You can add global helpers, e.g.
// (global as any).myHelper = () => { ... };
