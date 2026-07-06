# Implementation Plan: Seller Marketplace Polygon

Branch: feature/seller-marketplace-polygon
Created: 2026-07-06

## Original Request

да и делай aif-plan

## Settings
- Testing: yes
- Logging: verbose
- Docs: no  # warn-only

## Research Context

Source: .ai-factory/RESEARCH.md (Active Summary, Updated: 2026-07-06 20:56, SHA256: 88c9319befea1a27f77715fbdada574782b526691dd1e8468ea834f76ebe555b)

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
- resolved: wizard, минимальные страницы, статичные категории, мгновенный active

## Commit Plan

- **Commit 1** (after tasks 1-3): "feat(types): add Product types, zod schemas, seed data and categories"
- **Commit 2** (after tasks 4-6): "feat(products): add products table, wizard form, localStorage CRUD"
- **Commit 3** (after tasks 7-9): "feat(dashboard): rebrand to Seller Marketplace, seller stats, reset polygon"
- **Commit 4** (after tasks 10-11): "test: add useProducts and form validation tests; chore: lint+typecheck pass"
- **Commit 5** (after task 13): "feat(i18n): translate all UI text to Russian"

## Tasks

### Phase 1: Data Layer

- [x] Task 1: Define Product types and zod schemas
  - Add to `app/types/index.d.ts`: `Product`, `ProductStatus`, `ProductCategory`, `ProductPricing`, `ProductLogistics`, `ProductMedia`, `ProductAttributes` interfaces
  - Create `app/utils/productSchema.ts` with zod schemas: `productSchema` (full), `productStep1Schema` (identity), `productStep2Schema` (pricing), `productStep3Schema` (logistics), `productStep4Schema` (attributes+media)
  - Fields: id (uuid), name (min 3), offerId/artikel (min 3, required), category (select), price (number > 0), oldPrice (optional, number), vat (select 0/10/20), stock (number >= 0), sku (optional), mainImage (URL string optional), gallery (string[] optional), brand (string), color (select), weight (number g), dimensions {length, width, height} (cm), description (max 5000), shippingTemplate (select), packageType (select), status ('draft'|'pending'|'active'|'rejected')
  - LOGGING: console.debug('[productSchema] validating', { fieldName }) in zod refinements if any
  - Files: app/types/index.d.ts, app/utils/productSchema.ts

- [x] Task 2: Create categories tree and seed data
  - Create `app/utils/productCategories.ts`: flat list of ~25 categories with parent/child structure (Электроника → Телефоны, Ноутбуки, Планшеты; Одежда → Мужская, Женская, Детская; Дом → Мебель, Kitchen, Decor; etc.) — exported as `productCategories` array with {id, label, parent?}
  - Create `app/utils/productsSeed.ts`: 4-5 demo products covering different statuses and categories, exported as `productsSeed: Product[]`
  - LOGGING: none (static data)
  - Files: app/utils/productCategories.ts, app/utils/productsSeed.ts

- [x] Task 3: Create useProducts composable (localStorage CRUD + reset)
  - Create `app/composables/useProducts.ts` using `createSharedComposable` pattern from existing `useDashboard.ts`
  - Use `useLocalStorage<Product[]>('smp:products', productsSeed)` from VueUse — auto-syncs with localStorage, SSR-safe (returns initial value on server, real on client mount)
  - API: `products` (Ref<Product[]>), `addProduct(data: Omit<Product,'id'|'status'> & {status?: ProductStatus})`, `updateProduct(id: string, data: Partial<Product>)`, `deleteProduct(id: string)`, `deleteProducts(ids: string[])`, `getProduct(id: string)`, `resetPolygon()` (clears localStorage and restores seed), `productCount` (computed)
  - `addProduct` generates id via `crypto.randomUUID()` (fallback to Date.now+random for older browsers), defaults status to 'active'
  - All mutations should console.debug('[useProducts] action', { id, action }) for agent debuggability
  - LOGGING: console.debug('[useProducts] addProduct/updateProduct/deleteProduct/resetPolygon' with payload summary)
  - Files: app/composables/useProducts.ts
  - Depends on: 1, 2

### Phase 2: UI — Products Table + Form

- [x] Task 4: Build ProductsTable page (`app/pages/products.vue`)
  - Use TanStack Table pattern from `app/pages/customers.vue` as reference
  - Columns: checkbox select, name (with avatar thumbnail if mainImage), offerId, category (label), price (formatted ₽ via Intl.NumberFormat ru-RU), stock, status (badge: draft=neutral, pending=warning, active=success, rejected=error), actions (dropdown: edit, duplicate, delete)
  - Filters: search by name/offerId (UInput), status filter (USelect), column visibility dropdown
  - Toolbar: "New product" button (UButton icon plus → navigate to /products/new), delete selected button
  - Row click → navigate to `/products/[id]` (edit)
  - Pagination, empty-state ("No products yet. Create your first product.")
  - data-testid attributes: `products-table`, `products-new-button`, `products-search`, `products-status-filter`, `products-empty-state`, row `products-row-[id]`
  - LOGGING: console.debug('[products.vue] filter/search change', { value })
  - Files: app/pages/products.vue
  - Depends on: 3

- [x] Task 5: Build ProductForm wizard (`app/components/products/ProductForm.vue`)
  - 4-step wizard using UStepper or manual step state:
    - Step 1 "Основное": name, offerId, category (USelect from categories tree), brand
    - Step 2 "Цены и остатки": price, oldPrice, vat, stock, sku
    - Step 3 "Логистика": shippingTemplate (USelect), packageType (USelect), weight, dimensions (3x UInput number)
    - Step 4 "Описание и медиа": description (UTextarea), mainImage (UInput URL), gallery (UInput multiple URLs via tag input or simple array editor)
  - Each step validated with corresponding step schema before allowing "Next"
  - Props: `product?: Product` (for edit mode), emits `submit(data)`, `cancel`
  - Navigation: Back/Next buttons, "Save as draft" (status=draft) and "Publish" (status=active) on last step
  - data-testid on every field: `product-name`, `product-offer-id`, `product-category`, `product-brand`, `product-price`, `product-old-price`, `product-vat`, `product-stock`, `product-sku`, `product-shipping-template`, `product-package-type`, `product-weight`, `product-dimensions-length/width/height`, `product-description`, `product-main-image`, `product-gallery`, `product-next`, `product-back`, `product-save-draft`, `product-publish`
  - LOGGING: console.debug('[ProductForm] step change', { step, direction }), console.warn on validation failures
  - Files: app/components/products/ProductForm.vue
  - Depends on: 1, 3

- [x] Task 6: Wire ProductsTable ↔ ProductForm with pages and toasts
  - Create `app/pages/products/new.vue`: renders ProductForm in UPageCard, on submit → addProduct() + toast "Product created" + navigate to /products
  - Create `app/pages/products/[id].vue`: loads product via getProduct(id), renders ProductForm in edit mode, on submit → updateProduct() + toast "Product updated" + navigate to /products; handle not-found with 404 or redirect
  - Duplicate action in table dropdown → addProduct(copy without id) + toast
  - Delete action → confirm modal (reuse DeleteModal pattern) → deleteProduct() + toast "Product deleted"
  - Add `useHead` title per page: "New product — Seller Marketplace", "Edit: {name}", "Products — Seller Marketplace"
  - LOGGING: console.info('[products/new|edit] submit', { id, action: 'create'|'update' })
  - Files: app/pages/products/new.vue, app/pages/products/[id].vue, app/pages/products.vue (wire actions)
  - Depends on: 4, 5

### Phase 3: Rebrand + Dashboard + Settings

- [x] Task 7: Rebrand layout and navigation to Seller Marketplace
  - `app/layouts/default.vue`: rewrite `links` array — Home → "Dashboard" (i-lucide-layout-dashboard, to /), Products (i-lucide-package, to /products), Settings subtree (General /products reset). Remove Inbox/Customers links. Update search groups accordingly.
  - `app/components/TeamsMenu.vue`: replace Nuxt/NuxtHub/NuxtLabs teams with single "Seller Marketplace" entry (avatar: text "SM" or simple icon). Or simplify to a static UButton with label "Seller Marketplace".
  - `app/app.vue`: update title to "Seller Marketplace", description to "Личный кабинет продавца — полигон для тестирования"
  - `app/composables/useDashboard.ts`: update keyboard shortcuts (g-h→/, g-p→/products, g-s→/settings)
  - Update `UserMenu.vue` if it references Nuxt
  - LOGGING: none
  - Files: app/layouts/default.vue, app/components/TeamsMenu.vue, app/app.vue, app/composables/useDashboard.ts, app/components/UserMenu.vue
  - Depends on: 6

- [x] Task 8: Rewrite Dashboard page (seller stats from products)
  - `app/pages/index.vue`: remove HomeDateRangePicker/HomePeriodSelect/HomeChart/HomeSales usage (or keep HomeChart if adaptable)
  - Replace HomeStats with seller-relevant stats computed from `useProducts().products`: "Всего товаров" (productCount), "Активных" (status active count), "Черновики" (draft count), "Отклонено" (rejected count)
  - Optionally show recent products list (last 5) with link to /products
  - Add quick "New product" button → /products/new
  - data-testid: `dashboard-stat-total`, `dashboard-stat-active`, `dashboard-stat-draft`, `dashboard-stat-rejected`, `dashboard-recent-products`, `dashboard-new-product`
  - LOGGING: console.debug('[index.vue] stats computed', { total, active, draft, rejected })
  - Files: app/pages/index.vue, app/components/home/HomeStats.vue (modify or create SellerStats.vue)
  - Depends on: 3, 7

- [x] Task 9: Add Settings reset polygon section
  - `app/pages/settings/index.vue`: keep existing profile form OR replace with seller profile (name of shop, description, avatar). Add a "Полигон" section at the bottom with:
    - Description: "Сбросить все данные полигона к демо-набору"
    - Button "Reset polygon" (color error, variant outline) → calls resetPolygon() + toast "Polygon reset to seed" + navigate to /
  - Remove or stub other settings subpages (members, notifications, security) — either delete files or replace with "Coming soon" placeholders. Update sidebar children in default.vue accordingly.
  - data-testid: `settings-reset-polygon`, `settings-reset-confirm`
  - LOGGING: console.info('[settings] resetPolygon triggered')
  - Files: app/pages/settings/index.vue, app/pages/settings/members.vue, app/pages/settings/notifications.vue, app/pages/settings/security.vue
  - Depends on: 3, 7

### Phase 4: Cleanup

- [x] Task 10: Remove legacy pages and API routes
  - Delete `app/pages/inbox.vue`, `app/pages/customers.vue`
  - Delete `app/components/inbox/`, `app/components/customers/` directories
  - Delete `server/api/customers.ts`, `server/api/mails.ts` (keep members.ts and notifications.ts only if still referenced by settings; otherwise delete too)
  - Delete `app/components/home/HomeSales.vue`, `HomeChart.client.vue`, `HomeChart.server.vue`, `HomeDateRangePicker.vue`, `HomePeriodSelect.vue` if no longer referenced after dashboard rewrite
  - Clean up unused types in `app/types/index.d.ts` (Mail, User, Sale, Notification, Member if unused)
  - Update `app/types/index.d.ts` to only export product-related types
  - LOGGING: none
  - Files: app/pages/inbox.vue, app/pages/customers.vue, app/components/inbox/*, app/components/customers/*, server/api/*, app/components/home/*, app/types/index.d.ts
  - Depends on: 7, 8, 9

### Phase 5: Tests + Verification

- [x] Task 11: Add tests for useProducts composable + form validation
  - Check existing test setup: look for vitest/config in package.json or nuxt.config. If no test runner installed, add `vitest` + `@nuxt/test-utils` + `happy-dom` to devDependencies and create `vitest.config.ts` with `happy-dom` environment. Run `pnpm install`.
  - Create `test/composables/useProducts.test.ts`:
    - Must use `vi.mock('@vueuse/core')` to isolate `useLocalStorage` and `createSharedComposable` — mock `useLocalStorage` with a getter/setter ref backed by a local array, and `createSharedComposable` as identity passthrough
    - Use static `import { useProducts } from '~/composables/useProducts'` (NOT dynamic `await import`)
    - test addProduct creates product with uuid and status active
    - test updateProduct modifies fields
    - test deleteProduct removes by id
    - test resetPolygon restores seed
    - test getProduct returns correct product or null
  - Create `test/utils/productSchema.test.ts`:
    - test productStep1Schema requires name >= 3 and offerId
    - test productStep2Schema requires price > 0
    - test productStep4Schema description max 5000
    - test full productSchema validates a seed product
  - LOGGING: tests should use console via vitest's default reporters
  - Files: test/composables/useProducts.test.ts, test/utils/productSchema.test.ts, vitest.config.ts, package.json (test script)
  - Depends on: 1, 3

- [ ] Task 12: Lint + typecheck + dev smoke test
  - Run `pnpm lint` — fix any eslint errors (unused imports from deleted files, etc.)
  - Run `pnpm typecheck` (vue-tsc) — fix type errors
  - Run `pnpm dev` — manually verify: / loads dashboard with stats, /products shows table (seed products), /products/new wizard works, submit creates product visible in table, reload page → product persists, /settings reset works
  - If any command fails, fix the source and re-run
  - LOGGING: none (verification step)
  - Files: all
  - Depends on: 10, 11

### Phase 6: Russian UI

- [x] Task 13: Translate all user-facing UI text to Russian
  - Translate ALL English strings in .vue files and productCategories.ts to Russian:
  - `app/layouts/default.vue`: Dashboard→"Дашборд", Products→"Товары", Settings→"Настройки", General→"Общие", Polygon→"Полигон", Help & Support→"Помощь и поддержка", "Go to"→"Перейти"
  - `app/components/TeamsMenu.vue`: "Seller Marketplace"→keep as brand name
  - `app/components/UserMenu.vue`: Profile→"Профиль", Settings→"Настройки", Theme→"Тема", Primary→"Основной", Neutral→"Нейтральный", Appearance→"Оформление", Light→"Светлая", Dark→"Тёмная", Documentation→"Документация", Log out→"Выйти", user.name→"Продавец"
  - `app/components/NotificationsSlideover.vue`: "Notifications"→"Уведомления", "No notifications in the polygon."→"В полигоне нет уведомлений."
  - `app/error.vue`: "Page not found"→"Страница не найдена", description→"Извините, но эта страница не найдена."
  - `app/pages/index.vue`: "Dashboard"→"Дашборд", "New product"→"Новый товар", "Recent products"→"Недавние товары", "Last updated products"→"Последние обновлённые товары", "View all"→"Все товары", "No products yet..."→"Нет товаров. Создайте первый товар.", "in stock"→"на складе"
  - `app/pages/products.vue`: all column headers (Name→"Название", Category→"Категория", Brand→"Бренд", Price→"Цена", Stock→"Остаток", Status→"Статус"), actions (Actions→"Действия", Edit product→"Редактировать", Duplicate→"Дублировать", Delete product→"Удалить"), toasts, "Search products..."→"Поиск товаров...", filter labels (All→"Все", Active→"Активные", Pending→"На модерации", Draft→"Черновики", Rejected→"Отклонённые"), "Filter status"→"Фильтр по статусу", "New product"→"Новый товар", "Delete"→"Удалить", empty state, "row(s) selected"→"строк выбрано", "of"→"из"
  - `app/pages/products/new.vue`: "New product"→"Новый товар", "Back to products"→"К товарам", toast messages
  - `app/pages/products/[id].vue`: "Edit:"→"Редактирование:", "Product not found"→"Товар не найден", "Back to products"→"К товарам", toast messages
  - `app/components/products/ProductForm.vue`: ALL field labels (Product name→"Название товара", Article→"Артикул", Category→"Категория", Brand→"Бренд", Price→"Цена", Old price→"Старая цена", VAT rate→"Ставка НДС", Stock→"Остаток", SKU→"Артикул продавца", Shipping template→"Шаблон доставки", Package type→"Тип упаковки", Weight→"Вес", Dimensions→"Габариты", Length→"Длина", Width→"Ширина", Height→"Высота", Description→"Описание", Main image URL→"URL главного изображения", Gallery images→"Изображения галереи"), USelect option labels (Standard→"Стандартная", Express→"Экспресс", Pickup→"Самовывоз", Heavy→"Крупногабарит", Box→"Коробка", Bag→"Пакет", Envelope→"Конверт", Pallet→"Поддон"), buttons (Back→"Назад", Cancel→"Отмена", Next→"Далее", Save as draft→"Сохранить как черновик", Publish→"Опубликовать", Add→"Добавить"), placeholders
  - `app/pages/settings/index.vue`: all labels, descriptions, toasts, modal text → Russian
  - `app/pages/settings/polygon.vue`: all text → Russian
  - `app/pages/settings/members.vue`: "Members"→"Участники", "Coming soon"→"Скоро будет"
  - `app/pages/settings/notifications.vue`: "Notifications"→"Уведомления", "Coming soon"→"Скоро будет"
  - `app/pages/settings/security.vue`: "Security"→"Безопасность", "Coming soon"→"Скоро будет"
  - `app/utils/productCategories.ts`: translate ALL 28 category labels to Russian (Electronics→"Электроника", Phones→"Телефоны", etc.)
  - Add a status label map for display: draft→"черновик", pending→"на модерации", active→"активен", rejected→"отклонён"
  - `app/app.vue`: htmlAttrs lang="ru"
  - LOGGING: none
  - Files: all .vue files in app/, app/utils/productCategories.ts, app/app.vue
  - Depends on: 10