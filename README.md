# Canvas Drawing App

## Описание проекта

Canvas Drawing App — это веб-приложение для создания и редактирования фигур на интерактивном холсте. Приложение позволяет пользователям добавлять, перемещать, изменять размер и цвет фигур, а также масштабировать и перемещать сам холст.

## Функционал

- Добавление случайных фигур (прямоугольник, круг, треугольник) по клику на холст.
- Перемещение и изменение размера фигур.
- Изменение цвета фигур через контекстное меню.
- Масштабирование холста с помощью колесика мыши.
- Перемещение холста в режиме "Панорамирование".
- Сброс холста и удаление всех фигур.
- Справочное меню с инструкциями по использованию.
- Использованные технологии

## Приложение разработано с использованием следующих технологий:

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [React-Konva (для работы с холстом)](https://konvajs.org/docs/react/)
- [Material-UI (для UI-компонентов)](https://mui.com/)
- [UUID (для генерации уникальных идентификаторов фигур)](https://www.npmjs.com/package/uuid)


## Установка и запуск

### Клонируйте репозиторий
`git clone https://github.com/iamvldmrbrvkv/canvas-drawing-app`  
`cd <папка проекта>`

### Установите зависимости
`npm install`

#### Запустите приложение
`npm start`

## Управление

- Режим "Классический": кликните на холст, чтобы добавить случайную фигуру.
- Режим "Рисование": удерживайте кнопку мыши для добавления фигуры с увеличивающимся размером.
- Режим "Перемещение": удерживайте и двигайте мышь, чтобы перемещать холст.
- Колесико мыши: увеличивает или уменьшает масштаб.
- Контекстное меню (ПКМ на фигуре): изменение цвета и размера.
- Кнопка "Сброс": очистка холста.
- Кнопка "Справка": открывает справочное меню с инструкциями.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
