import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettierConfig from 'eslint-config-prettier'
import vueParser from 'vue-eslint-parser'

export default [
    // Base settings with ignores
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'public/**',
            '.nuxt/**',
            '.output/**',
            'coverage/**',
        ],
    },
    // JavaScript and TypeScript files
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,

            // TypeScript rules
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',

            // General JavaScript/TypeScript rules
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',
            'no-unused-vars': 'off', // Use TypeScript version instead
        },
    },
    // Vue files
    {
        files: ['**/*.vue'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parser: vueParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            vue: pluginVue,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            ...pluginVue.configs['flat/essential'].rules,

            // Vue-specific rules
            'vue/multi-word-component-names': 'off',
            'vue/no-reserved-component-names': 'error',
            'vue/require-default-prop': 'off',
            'vue/no-v-html': 'warn',
            'vue/component-name-in-template-casing': ['error', 'PascalCase'],
            'vue/custom-event-name-casing': 'error',
            'vue/html-button-has-type': 'off', // Often not needed in Vue

            // TypeScript rules for Vue files
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',

            // General rules for Vue files
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',
            'no-unused-vars': 'off', // Use TypeScript version instead
        },
    },
    // Prettier config to disable conflicting rules
    prettierConfig,
]
