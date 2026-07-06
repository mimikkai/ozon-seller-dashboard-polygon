# Research

Updated: 2026-07-06 20:56
Status: active

## Active Summary (input for /aif-plan)
<!-- aif:active-summary:start -->
Topic: Полигон-дашборд «Seller Marketplace» — имитация личного кабинета продавца маркетплейса (по мотивам Ozon) для тренировки/тестирования ИИ-агентов через MCP-браузер.

Goal: Переделать существующий Nuxt UI dashboard template в полигон, где:
- есть форма заполнения карточек товаров (множество полей разных типов)
- заполненные карточки сохраняются в localStorage (персистентно в браузере)
- есть таблица со списком созданных карточек
- ИИ-агент через MCP playwright может тренироваться заполнять/редактировать/создавать карточки

Constraints:
- Стек: Nuxt 4, @nuxt/ui v4, VueUse, zod, TanStack Table — всё уже в package.json
- localStorage через `useLocalStorage` из VueUse (SSR-безопасно через onMounted/init)
- Бренд: «Seller Marketplace» (нейтрально, без упоминания Ozon во избежание проблем)
- data-testid на всех полях формы для playwright-локаторов
- Тосты после save/delete — для обратной связи агенту
- Кнопка сброса полигона (очистка localStorage)

Decisions:
- Гибридное хранение: seed-данные в utils, далее только localStorage через useLocalStorage
- Форма: wizard (stepper) — ближе к реальному UX маркетплейса
- Минимальный набор страниц: Dashboard + Products (таблица + форма) + Settings (reset)
- Категории: статичное дерево (~20-30 элементов)
- Модерация: упрощённая — save = сразу active (без задержек)
- Стиль: нейтральный Nuxt UI (light/dark), без копирования брендинга

Open questions:
- (на момент выхода из explore) resolved: wizard, минимальные страницы, статичные категории, мгновенный active

Success signals:
- Агент может: открыть /products → «New» → заполнить wizard → submit → увидеть новую строку
- Данные переживают reload страницы (localStorage)
- Кнопка reset очищает всё к seed
- pnpm typecheck и pnpm lint проходят

Next step: /aif-plan для создания плана реализации
<!-- aif:active-summary:end -->

## Sessions
<!-- aif:sessions:start -->
### 2026-07-06 20:56 — Explore: полигон Seller Marketplace
What changed: Решено переделать Nuxt UI dashboard template в полигон для тренировки ИИ-агентов. Определены: форма-wizard, localStorage-персистентность, нейтральный бренд «Seller Marketplace», data-testid для playwright.
Key notes:
- Текущий стек: Nuxt 4 + @nuxt/ui 4 + VueUse + zod + TanStack Table + Unovis
- Структура карточки: identity, pricing, inventory, media, attributes, logistics, status
- Гибрид: seed в utils + useLocalStorage из VueUse
- Риск SSR+localStorage → ClientOnly или onMounted init
- Сценарии агента: навигация, создание, валидация, редактирование, сброс, поиск
Links (paths):
- app/layouts/default.vue (sidebar навигация — переписать links)
- app/pages/customers.vue (референс таблицы + TanStack patterns)
- app/components/customers/AddModal.vue (референс модал-формы)
- app/types/index.d.ts (добавить Product-типы)
- app/composables/useDashboard.ts (референс composable patterns)
<!-- aif:sessions:end -->