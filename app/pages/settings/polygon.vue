<script setup lang="ts">
const LOG_LEVEL = import.meta.env.LOG_LEVEL || 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[settings/polygon] ${message}`, data ?? '')
  }
}

const toast = useToast()
const router = useRouter()
const { resetPolygon, productCount } = useProducts()

useHead({ title: 'Полигон — Seller Marketplace' })

const resetModalOpen = ref(false)

function confirmReset() {
  debug('resetPolygon triggered')
  resetPolygon()
  toast.add({
    title: 'Полигон сброшен',
    description: 'Все товары восстановлены из демо-набора.',
    color: 'warning',
    icon: 'i-lucide-rotate-ccw'
  })
  resetModalOpen.value = false
  router.push('/')
}
</script>

<template>
  <UDashboardPanel id="polygon-settings">
    <template #header>
      <UDashboardNavbar title="Полигон">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard
        title="Управление полигоном"
        description="Полигон использует localStorage для хранения товаров в браузере. Сброс восстановит исходный демо-набор."
        variant="subtle"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 rounded-lg bg-elevated/50">
            <div>
              <p class="font-medium">
                Товаров в localStorage
              </p>
              <p class="text-muted text-sm">
                {{ productCount }} товар(ов)
              </p>
            </div>
            <UIcon name="i-lucide-database" class="size-8 text-muted" />
          </div>

          <div class="flex items-center justify-between p-4 rounded-lg border border-error/20 bg-error/5">
            <div>
              <p class="font-medium text-error">
                Сбросить полигон к демо-набору
              </p>
              <p class="text-muted text-sm">
                Удаляет все товары и восстанавливает 5 демо-товаров.
              </p>
            </div>
            <UButton
              label="Сбросить"
              icon="i-lucide-rotate-ccw"
              color="error"
              variant="outline"
              data-testid="settings-reset-polygon"
              @click="resetModalOpen = true"
            />
          </div>
        </div>
      </UPageCard>

      <UModal
        v-model:open="resetModalOpen"
        title="Сбросить полигон?"
        description="Это удалит все товары и восстановит демо-набор. Действие нельзя отменить."
      >
        <template #body>
          <div class="flex justify-end gap-2">
            <UButton
              label="Отмена"
              color="neutral"
              variant="subtle"
              @click="resetModalOpen = false"
            />
            <UButton
              label="Сбросить"
              color="error"
              variant="solid"
              icon="i-lucide-rotate-ccw"
              data-testid="settings-reset-confirm"
              @click="confirmReset"
            />
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
