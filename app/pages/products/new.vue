<script setup lang="ts">
import type { Product, ProductStatus } from '~/types'
import { statusLabels } from '~/utils/statusLabels'

const LOG_LEVEL = import.meta.env.LOG_LEVEL || 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[products/new] ${message}`, data ?? '')
  }
}

const toast = useToast()
const router = useRouter()
const { addProduct } = useProducts()

useHead({ title: 'Новый товар — Seller Marketplace' })

function onSubmit(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { status: ProductStatus }) {
  debug('submit create', { name: data.name, status: data.status })
  const product = addProduct(data)
  toast.add({
    title: 'Товар создан',
    description: `«${product.name}» создан со статусом «${statusLabels[product.status]}».`,
    color: 'success',
    icon: 'i-lucide-check'
  })
  router.push('/products')
}

function onCancel() {
  debug('cancel')
  router.push('/products')
}
</script>

<template>
  <UDashboardPanel id="product-new">
    <template #header>
      <UDashboardNavbar title="Новый товар">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="К товарам"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/products"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard variant="subtle">
        <ClientOnly>
          <ProductsProductForm @submit="onSubmit" @cancel="onCancel" />
          <template #fallback>
            <div class="flex items-center justify-center py-12">
              <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-dimmed" />
            </div>
          </template>
        </ClientOnly>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>
