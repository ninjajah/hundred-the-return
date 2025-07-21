import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettierConfig from 'eslint-config-prettier'

export default [
    // Base settings with ignores
    {
        ignores: ['node_modules/**', 'dist/**', 'public/**'],
    },
    // JavaScript and TypeScript base config
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
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
            // Custom rules
            'vue/multi-word-component-names': 'off',
            'vue/no-reserved-component-names': 'error',
            'vue/require-default-prop': 'off',
        },
    },
    // Prettier config to disable conflicting rules
    prettierConfig,
]
