# Разработка проекта

## Инструменты качества кода

В проекте настроены ESLint и Prettier для поддержания единообразного стиля кода.

### Доступные скрипты

#### 🔍 Проверка качества кода

```bash
# Проверить все аспекты качества кода (рекомендуется перед commit)
npm run code-quality

# Проверить только ESLint
npm run lint:check

# Проверить только Prettier
npm run format:check

# Проверить только TypeScript типы
npm run type-check
```

#### 🛠 Автоматическое исправление

```bash
# Автоматически исправить все проблемы с форматированием и линтингом
npm run fix

# Только форматирование кода
npm run format

# Только исправление ESLint ошибок
npm run lint
```

### Настройки редактора

#### VS Code

1. Установите рекомендуемые расширения:
    - Vue Language Features (Volar)
    - TypeScript Vue Plugin (Volar)
    - Prettier - Code formatter
    - ESLint

2. Настройки редактора автоматически применяются из `.vscode/settings.json`

#### Другие редакторы

Убедитесь, что ваш редактор поддерживает:

- ESLint для проверки кода
- Prettier для форматирования
- EditorConfig для базовых настроек

### Конфигурационные файлы

- **ESLint**: `eslint.config.js` - правила линтинга для JS/TS/Vue
- **Prettier**: `.prettierrc` - правила форматирования кода
- **Prettier ignore**: `.prettierignore` - файлы, исключенные из форматирования
- **VS Code**: `.vscode/settings.json` - настройки для редактора
- **VS Code**: `.vscode/extensions.json` - рекомендуемые расширения

### Рекомендации по разработке

1. **Перед коммитом** всегда запускайте:

    ```bash
    npm run code-quality
    ```

2. **При разработке** настройте автоматическое форматирование в редакторе

3. **При возникновении проблем** с кодом:

    ```bash
    npm run fix
    ```

4. **Следуйте правилам**:
    - Используйте TypeScript для типобезопасности
    - Избегайте `any`, используйте конкретные типы
    - Следуйте соглашениям по именованию Vue компонентов
    - Не оставляйте неиспользуемые переменные

### Правила ESLint

#### Vue-специфичные правила:

- `vue/multi-word-component-names`: выключено (разрешены односложные имена)
- `vue/component-name-in-template-casing`: PascalCase для компонентов
- `vue/html-button-has-type`: выключено для Vue компонентов

#### TypeScript правила:

- `@typescript-eslint/no-unused-vars`: ошибка (с исключением для `_` префикса)
- `@typescript-eslint/no-explicit-any`: предупреждение
- `@typescript-eslint/explicit-function-return-type`: выключено

#### Общие правила:

- `no-console`: предупреждение (разрешены `warn` и `error`)
- `prefer-const`: ошибка
- `no-var`: ошибка

### Настройки Prettier

```json
{
    "trailingComma": "es5",
    "tabWidth": 4,
    "semi": false,
    "singleQuote": true,
    "printWidth": 80,
    "arrowParens": "avoid",
    "plugins": ["prettier-plugin-tailwindcss"]
}
```

### EditorConfig

Проект использует `.editorconfig` для единообразного форматирования во всех редакторах:

- **Отступы**: 4 пробела для JS/TS/Vue файлов
- **Окончания строк**: LF (Unix-style)
- **Кодировка**: UTF-8
- **Удаление пробелов** в конце строк

### Troubleshooting

#### ESLint ошибки

```bash
# Автоматическое исправление
npm run lint

# Проверка без исправлений
npm run lint:check
```

#### Prettier ошибки

```bash
# Автоматическое форматирование
npm run format

# Проверка форматирования
npm run format:check
```

#### TypeScript ошибки

```bash
# Проверка типов
npm run type-check

# Сборка с проверкой типов
npm run build
```

#### Все проблемы сразу

```bash
# Исправить все что можно автоматически
npm run fix

# Проверить все аспекты качества
npm run code-quality
```
