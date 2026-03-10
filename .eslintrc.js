module.exports = {
  root: true, // Treat this as the root ESLint config (prevents ESLint from searching parent directories)
  env: {
    node: true, // Enables Node.js global variables (e.g., `process`)
    browser: true, // Enables browser global variables (e.g., `window`, `document`)
    es2021: true, // Supports ECMAScript 2021 features
  },
  extends: [
    'eslint:recommended', // Base ESLint recommended rules
    'plugin:@typescript-eslint/recommended', // TypeScript linting rules
    'plugin:prettier/recommended', // Integrates Prettier for formatting (Prettier errors show in ESLint)
    'plugin:import/recommended', // Helps with import order and unused imports
    'plugin:import/typescript', // Supports TypeScript-specific import rules
  ],
  parser: '@typescript-eslint/parser', // Uses TypeScript parser instead of default ESLint parser
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2021, // Supports modern ES2021 syntax
    sourceType: 'module', // Allows using `import` and `export`
  },
  plugins: [
    '@typescript-eslint', // TypeScript linting plugin
    'prettier', // Prettier plugin for code formatting
    'import', // Helps enforce import/export best practices
    'unused-imports', // Detects unused imports
    'simple-import-sort', // Helps automatically sort imports
  ],
  rules: {
    'prettier/prettier': 'error', // Throws errors when Prettier formatting rules are broken
    'import/order': 'off', // Disables default import sorting rule (we use `simple-import-sort`)
    'simple-import-sort/imports': 'error', // Automatically sorts imports
    'simple-import-sort/exports': 'error', // Automatically sorts exports
    'unused-imports/no-unused-imports': 'error', // Removes unused imports
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Allows unused variables prefixed with `_`
    'react/react-in-jsx-scope': 'off', // Disables the rule requiring `import React` in React 17+ projects (not needed in Next.js)
  },
  settings: {
    react: {
      version: 'detect', // Auto-detects the React version
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json', // Ensure it points to the correct tsconfig file
      },
    },
  },
  ignorePatterns: ['.eslintrc.js'], // Add this line to ignore .eslintrc.js file
};
