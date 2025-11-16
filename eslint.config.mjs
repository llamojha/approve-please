import nextConfig from 'eslint-config-next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = [
  ...nextConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'react-hooks/set-state-in-effect': 'off'
    }
  }
];

export default config;
