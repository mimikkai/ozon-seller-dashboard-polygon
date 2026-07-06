<script setup lang="ts">
import { statusLabels, statusColors } from '~/utils/statusLabels'

const LOG_LEVEL = import.meta.env.LOG_LEVEL || 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[index.vue] ${message}`, data ?? '')
  }
}

const { products, productCount } = useProducts()
const router = useRouter()

useHead({ title: 'Дашборд — Seller Marketplace' })

const stats = computed(() => {
  const total = productCount.value
  const active = products.value.filter(p => p.status === 'active').length
  const draft = products.value.filter(p => p.status === 'draft').length
  const pending = products.value.filter(p => p.status === 'pending').length
  const rejected = products.value.filter(p => p.status === 'rejected').length
  debug('stats computed', { total, active, draft, pending, rejected })
  return { total, active, draft, pending, rejected }
})

const recentProducts = computed(() => {
  return [...products.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
})

const statCards = computed(() => [
  {
    title: 'Всего товаров',
    icon: 'i-lucide-package',
    value: stats.value.total,
    color: 'primary' as const
  },
  {
    title: 'Активных',
    icon: 'i-lucide-check-circle',
    value: stats.value.active,
    color: 'success' as const
  },
  {
    title: 'На модерации',
    icon: 'i-lucide-clock',
    value: stats.value.pending,
    color: 'warning' as const
  },
  {
    title: 'Черновиков',
    icon: 'i-lucide-file-edit',
    value: stats.value.draft,
    color: 'neutral' as const
  }
])

function navigateToNew() {
  debug('navigate to /products/new')
  router.push('/products/new')
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Дашборд">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Новый товар"
            icon="i-lucide-plus"
            color="primary"
            class="rounded-full"
            data-testid="dashboard-new-product"
            @click="navigateToNew"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ClientOnly>
        <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
          <UPageCard
            v-for="(stat, index) in statCards"
            :key="index"
            :icon="stat.icon"
            :title="stat.title"
            variant="subtle"
            :ui="{
              container: 'gap-y-1.5',
              wrapper: 'items-start',
              leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col'
            }"
            class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
            :data-testid="`dashboard-stat-${index}`"
          >
            <span class="text-2xl font-semibold text-highlighted">
              {{ stat.value }}
            </span>
          </UPageCard>
        </UPageGrid>

        <UPageCard
          title="Недавние товары"
          description="Последние обновлённые товары"
          variant="subtle"
          class="mt-6"
        >
          <template #links>
            <UButton
              label="Все товары"
              to="/products"
              color="neutral"
              variant="ghost"
              size="xs"
            />
          </template>

          <div v-if="recentProducts.length === 0" class="text-muted py-8 text-center">
            Нет товаров. Создайте первый товар.
          </div>
          <div v-else class="space-y-2" data-testid="dashboard-recent-products">
            <NuxtLink
              v-for="product in recentProducts"
              :key="product.id"
              :to="`/products/${product.id}`"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-elevated/50 transition-colors"
            >
              <UAvatar
                :src="product.mainImage"
                :alt="product.name"
                size="md"
                icon="i-lucide-package"
              />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-highlighted truncate">
                  {{ product.name }}
                </p>
                <p class="text-muted text-sm">
                  {{ formatPrice(product.price) }} · {{ product.stock }} на складе
                </p>
              </div>
              <UBadge
                :color="statusColors[product.status]"
                variant="subtle"
              >
                {{ statusLabels[product.status] }}
              </UBadge>
            </NuxtLink>
          </div>
        </UPageCard>

        <template #fallback>
          <div class="flex items-center justify-center py-12">
            <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-dimmed" />
          </div>
        </template>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>
