# 🚀Backend на Express.js + TypeScript

## 📦 Инсталация и стартиране

1. Уверете се, че имате инсталиран **Node.js** (препоръчителна версия: `18+`).  
След това инсталирайте зависимостите:

```sh
npm install
```

2. Конфигуриране на средата

Създайте файл `.env` в главната директория и добавете необходимите променливи, например:

* `NODE_ENV=development`
* `SERVER_HOSTNAME=localhost`
* `SERVER_PORT=8080`
* `... DB_[VARIABLES]`

3. За да стартирате локалния сървър в development mode (рекомендовано за `development mode`), използвайте командата:
```sh
npm run dev
```
След това приложението ще бъде достъпно на: `http://localhost:8080`.


4. Стартиране в продукционен режим (не ни трябва по време на разработка)

`npm run build`

`npm start`

## 🔧 Структура на бекенда

backend/
* src/
  * config/               # Конфигурационни файлове
  * controllers/          # Контролери на API
  * middlewares/          # Middleware функции
  * index.ts              # Основна входна точка на приложението
* package.json              # Зависимости и скриптове
* tsconfig.json             # Конфигурация на TypeScript
* nodemon.json              # Конфигурация на nodemon

## 🚀 Използвани технологии

🟢Node.js

⚡ Express.js

📜 TypeScript – статична типизация за по-добра поддръжка на кода

🔄 Nodemon (за автоматично презареждане в режим на разработка)

## 📜 Лиценз

Този проект се разпространява под MIT лиценз.