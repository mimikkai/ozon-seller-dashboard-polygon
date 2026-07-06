<script setup lang="ts">
import type { Product, ProductStatus } from '~/types'

const LOG_LEVEL = import.meta.env.LOG_LEVEL || 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[products/edit] ${message}`, data ?? '')
  }
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { getProduct, updateProduct } = useProducts()

const productId = computed(() => route.params.id as string)

const product = computed(() => getProduct(productId.value))

useHead({ title: computed(() => `Редактирование: ${product.value?.name ?? 'Товар'} — Seller Marketplace`) })

function onSubmit(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { status: ProductStatus }) {
  debug('submit update', { id: productId.value, name: data.name, status: data.status })
  updateProduct(productId.value, data)
  toast.add({
    title: 'Товар обновлён',
    description: `«${data.name}» обновлён.`,
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
  <UDashboardPanel id="product-edit">
    <template #header>
      <UDashboardNavbar :title="product ? `Редактирование: ${product.name}` : 'Товар не найден'">
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
      <div v-if="!product" class="flex flex-col items-center justify-center py-12 gap-4">
        <UIcon name="i-lucide-package-x" class="size-12 text-dimmed" />
        <p class="text-muted">
          Товар не найден.
        </p>
        <UButton
          label="К товарам"
          icon="i-lucide-arrow-left"
          color="primary"
          to="/products"
        />
      </div>
      <UPageCard v-else variant="subtle">
        <ClientOnly>
          <ProductsProductForm :product="product" @submit="onSubmit" @cancel="onCancel" />
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
