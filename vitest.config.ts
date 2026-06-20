import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Runs before every test file: sandboxes $HOME so global-scope (`-g`)
    // skill operations never touch the real ~/.agents / ~/.claude dirs.
    setupFiles: ['./vitest.setup.ts'],
  },
});
