<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const LOG_LEVEL = import.meta.env.LOG_LEVEL || 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[settings/index] ${message}`, data ?? '')
  }
}

const toast = useToast()
const router = useRouter()
const { resetPolygon } = useProducts()

const profileSchema = z.object({
  shopName: z.string().min(2, 'Слишком короткое название'),
  description: z.string().optional(),
  avatar: z.string().optional()
})

type ProfileSchema = z.output<typeof profileSchema>

const profile = reactive<Partial<ProfileSchema>>({
  shopName: 'Мой магазин',
  description: 'Демо-магазин для тестирования ИИ-агентов на полигоне Seller Marketplace.',
  avatar: undefined
})

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  debug('profile save', { shopName: event.data.shopName })
  toast.add({
    title: 'Готово',
    description: 'Настройки сохранены.',
    icon: 'i-lucide-check',
    color: 'success'
  })
}

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
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Профиль магазина"
      description="Эта информация будет отображаться на странице вашего магазина."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Сохранить"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="shopName"
        label="Название магазина"
        description="Будет отображаться на странице магазина и в чеках."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.shopName"
          autocomplete="off"
          data-testid="settings-shop-name"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="description"
        label="Описание"
        description="Краткое описание вашего магазина."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea
          v-model="profile.description"
          :rows="5"
          autoresize
          class="w-full"
          data-testid="settings-description"
        />
      </UFormField>
    </UPageCard>

    <UPageCard
      title="Полигон"
      description="Сбросить все данные полигона к демо-набору."
      variant="naked"
      orientation="horizontal"
      class="mt-4 mb-4"
    >
      <UButton
        label="Сбросить полигон"
        icon="i-lucide-rotate-ccw"
        color="error"
        variant="outline"
        data-testid="settings-reset-polygon"
        @click="resetModalOpen = true"
      />
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
  </UForm>
</template>
