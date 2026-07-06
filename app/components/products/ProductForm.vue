<script setup lang="ts">
import type { Product, ProductStatus, VatRate, ShippingTemplate, PackageType } from '~/types'
import { productStep1Schema, productStep2Schema, productStep3Schema, productStep4Schema } from '~/utils/productSchema'
import { categoryOptions } from '~/utils/productCategories'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  product?: Product
}>()

const emit = defineEmits<{
  submit: [data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { status: ProductStatus }]
  cancel: []
}>()

const LOG_LEVEL = import.meta.env.LOG_LEVEL || 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[ProductForm] ${message}`, data ?? '')
  }
}

function warn(message: string, data?: unknown) {
  console.warn(`[ProductForm] ${message}`, data ?? '')
}

const steps = [
  { label: 'Основное', description: 'Название, артикул, категория, бренд' },
  { label: 'Цены и остатки', description: 'Цена, НДС, остаток, SKU' },
  { label: 'Логистика', description: 'Доставка, упаковка, вес, габариты' },
  { label: 'Описание и медиа', description: 'Описание, изображения' }
]

const currentStep = ref(0)

const state = reactive({
  name: props.product?.name ?? '',
  offerId: props.product?.offerId ?? '',
  categoryId: props.product?.categoryId ?? '',
  brand: props.product?.brand ?? '',
  price: props.product?.price ?? 0,
  oldPrice: props.product?.oldPrice ?? undefined,
  vat: props.product?.vat ?? '20' as VatRate,
  stock: props.product?.stock ?? 0,
  sku: props.product?.sku ?? '',
  shippingTemplate: props.product?.shippingTemplate ?? 'standard' as ShippingTemplate,
  packageType: props.product?.packageType ?? 'box' as PackageType,
  weight: props.product?.weight ?? 0,
  dimensions: {
    length: props.product?.dimensions.length ?? 0,
    width: props.product?.dimensions.width ?? 0,
    height: props.product?.dimensions.height ?? 0
  },
  description: props.product?.description ?? '',
  mainImage: props.product?.mainImage ?? '',
  gallery: props.product?.gallery ?? []
})

const galleryInput = ref('')

const stepSchemas = [productStep1Schema, productStep2Schema, productStep3Schema, productStep4Schema]
const stepFields: string[][] = [
  ['name', 'offerId', 'categoryId', 'brand'],
  ['price', 'oldPrice', 'vat', 'stock', 'sku'],
  ['shippingTemplate', 'packageType', 'weight', 'dimensions'],
  ['description', 'mainImage', 'gallery']
]

const isLastStep = computed(() => currentStep.value === steps.length - 1)
const isFirstStep = computed(() => currentStep.value === 0)

function validateCurrentStep(): boolean {
  const schema = stepSchemas[currentStep.value]
  if (!schema) return true
  const fields = stepFields[currentStep.value] ?? []
  const partialState: Record<string, unknown> = {}
  for (const field of fields) {
    partialState[field] = (state as Record<string, unknown>)[field]
  }
  const result = schema.safeParse(partialState)
  debug('validate step', { step: currentStep.value, success: result.success })
  if (!result.success) {
    warn('validation failed', { step: currentStep.value, errors: result.error.issues })
  }
  return result.success
}

function next() {
  debug('step change attempt', { step: currentStep.value, direction: 'next' })
  if (!validateCurrentStep()) {
    return
  }
  currentStep.value = Math.min(currentStep.value + 1, steps.length - 1)
  debug('step changed', { step: currentStep.value })
}

function back() {
  debug('step change attempt', { step: currentStep.value, direction: 'back' })
  currentStep.value = Math.max(currentStep.value - 1, 0)
  debug('step changed', { step: currentStep.value })
}

function addGalleryItem() {
  const url = galleryInput.value.trim()
  if (!url) return
  debug('add gallery item', { url })
  state.gallery = [...(state.gallery ?? []), url]
  galleryInput.value = ''
}

function removeGalleryItem(index: number) {
  debug('remove gallery item', { index })
  state.gallery = state.gallery?.filter((_, i) => i !== index) ?? []
}

function buildProductData(status: ProductStatus) {
  return {
    name: state.name,
    offerId: state.offerId,
    categoryId: state.categoryId,
    brand: state.brand,
    price: state.price,
    oldPrice: state.oldPrice,
    vat: state.vat,
    stock: state.stock,
    sku: state.sku || undefined,
    shippingTemplate: state.shippingTemplate,
    packageType: state.packageType,
    weight: state.weight,
    dimensions: state.dimensions,
    description: state.description,
    mainImage: state.mainImage || undefined,
    gallery: state.gallery?.length ? state.gallery : undefined,
    status
  }
}

function saveDraft() {
  debug('saveDraft called')
  emit('submit', buildProductData('draft'))
}

function publish(event: FormSubmitEvent<unknown>) {
  debug('publish called', { event: !!event })
  if (!validateCurrentStep()) {
    warn('publish blocked — validation failed on last step')
    return
  }
  emit('submit', buildProductData('active'))
}

function cancel() {
  debug('cancel called')
  emit('cancel')
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <UStepper
      :model-value="currentStep"
      :items="steps"
      class="w-full"
      data-testid="product-stepper"
    />

    <UForm
      :state="state"
      class="space-y-6"
      @submit="publish"
    >
      <!-- Step 1: Основное -->
      <div v-if="currentStep === 0" class="space-y-4" data-testid="product-step-1">
        <UFormField label="Название товара" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Беспроводные наушники Pro"
            class="w-full"
            data-testid="product-name"
          />
        </UFormField>

        <UFormField label="Артикул (offer ID)" name="offerId" required>
          <UInput
            v-model="state.offerId"
            placeholder="SKU-EARB-001"
            class="w-full"
            data-testid="product-offer-id"
          />
        </UFormField>

        <UFormField label="Категория" name="categoryId" required>
          <USelect
            v-model="state.categoryId"
            :items="categoryOptions"
            placeholder="Выберите категорию"
            class="w-full"
            data-testid="product-category"
          />
        </UFormField>

        <UFormField label="Бренд" name="brand" required>
          <UInput
            v-model="state.brand"
            placeholder="SoundWave"
            class="w-full"
            data-testid="product-brand"
          />
        </UFormField>
      </div>

      <!-- Step 2: Цены и остатки -->
      <div v-if="currentStep === 1" class="space-y-4" data-testid="product-step-2">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Цена (₽)" name="price" required>
            <UInput
              v-model.number="state.price"
              type="number"
              placeholder="4990"
              class="w-full"
              data-testid="product-price"
            />
          </UFormField>

          <UFormField label="Старая цена (₽)" name="oldPrice">
            <UInput
              v-model.number="state.oldPrice"
              type="number"
              placeholder="6990"
              class="w-full"
              data-testid="product-old-price"
            />
          </UFormField>
        </div>

        <UFormField label="Ставка НДС" name="vat">
          <USelect
            v-model="state.vat"
            :items="[
              { label: '0%', value: '0' },
              { label: '10%', value: '10' },
              { label: '20%', value: '20' }
            ]"
            class="w-full"
            data-testid="product-vat"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Остаток" name="stock" required>
            <UInput
              v-model.number="state.stock"
              type="number"
              placeholder="150"
              class="w-full"
              data-testid="product-stock"
            />
          </UFormField>

          <UFormField label="Артикул продавца" name="sku">
            <UInput
              v-model="state.sku"
              placeholder="SW-EB-PRO"
              class="w-full"
              data-testid="product-sku"
            />
          </UFormField>
        </div>
      </div>

      <!-- Step 3: Логистика -->
      <div v-if="currentStep === 2" class="space-y-4" data-testid="product-step-3">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Шаблон доставки" name="shippingTemplate" required>
            <USelect
              v-model="state.shippingTemplate"
              :items="[
                { label: 'Стандартная', value: 'standard' },
                { label: 'Экспресс', value: 'express' },
                { label: 'Самовывоз', value: 'pickup' },
                { label: 'Крупногабарит', value: 'heavy' }
              ]"
              class="w-full"
              data-testid="product-shipping-template"
            />
          </UFormField>

          <UFormField label="Тип упаковки" name="packageType" required>
            <USelect
              v-model="state.packageType"
              :items="[
                { label: 'Коробка', value: 'box' },
                { label: 'Пакет', value: 'bag' },
                { label: 'Конверт', value: 'envelope' },
                { label: 'Поддон', value: 'pallet' }
              ]"
              class="w-full"
              data-testid="product-package-type"
            />
          </UFormField>
        </div>

        <UFormField label="Вес (граммы)" name="weight" required>
          <UInput
            v-model.number="state.weight"
            type="number"
            placeholder="120"
            class="w-full"
            data-testid="product-weight"
          />
        </UFormField>

        <div>
          <p class="mb-2 text-sm font-medium">
            Габариты (см)
          </p>
          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Длина" name="dimensions.length" required>
              <UInput
                v-model.number="state.dimensions.length"
                type="number"
                placeholder="10"
                class="w-full"
                data-testid="product-dimensions-length"
              />
            </UFormField>
            <UFormField label="Ширина" name="dimensions.width" required>
              <UInput
                v-model.number="state.dimensions.width"
                type="number"
                placeholder="8"
                class="w-full"
                data-testid="product-dimensions-width"
              />
            </UFormField>
            <UFormField label="Высота" name="dimensions.height" required>
              <UInput
                v-model.number="state.dimensions.height"
                type="number"
                placeholder="4"
                class="w-full"
                data-testid="product-dimensions-height"
              />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Step 4: Описание и медиа -->
      <div v-if="currentStep === 3" class="space-y-4" data-testid="product-step-4">
        <UFormField label="Описание" name="description" required>
          <UTextarea
            v-model="state.description"
            :rows="5"
            autoresize
            placeholder="Описание товара..."
            class="w-full"
            data-testid="product-description"
          />
        </UFormField>

        <UFormField label="URL главного изображения" name="mainImage">
          <UInput
            v-model="state.mainImage"
            placeholder="https://..."
            class="w-full"
            data-testid="product-main-image"
          />
        </UFormField>

        <UFormField label="Изображения галереи" name="gallery">
          <div class="space-y-2 w-full">
            <div class="flex gap-2">
              <UInput
                v-model="galleryInput"
                placeholder="https://..."
                class="flex-1"
                data-testid="product-gallery-input"
              />
              <UButton
                label="Добавить"
                icon="i-lucide-plus"
                color="neutral"
                variant="outline"
                data-testid="product-gallery-add"
                @click="addGalleryItem"
              />
            </div>
            <div
              v-if="state.gallery && state.gallery.length > 0"
              class="space-y-2"
              data-testid="product-gallery-list"
            >
              <div
                v-for="(url, index) in state.gallery"
                :key="index"
                class="flex items-center gap-2"
              >
                <UInput
                  :model-value="url"
                  disabled
                  class="flex-1"
                />
                <UButton
                  icon="i-lucide-x"
                  color="error"
                  variant="ghost"
                  :data-testid="`product-gallery-remove-${index}`"
                  @click="removeGalleryItem(index)"
                />
              </div>
            </div>
          </div>
        </UFormField>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between pt-4 border-t border-default">
        <div class="flex gap-2">
          <UButton
            v-if="!isFirstStep"
            label="Назад"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="subtle"
            data-testid="product-back"
            @click="back"
          />
        </div>

        <div class="flex gap-2">
          <UButton
            label="Отмена"
            color="neutral"
            variant="ghost"
            data-testid="product-cancel"
            @click="cancel"
          />
          <UButton
            v-if="!isLastStep"
            label="Далее"
            icon="i-lucide-arrow-right"
            color="primary"
            data-testid="product-next"
            @click="next"
          />
          <template v-else>
            <UButton
              label="Сохранить как черновик"
              color="neutral"
              variant="subtle"
              data-testid="product-save-draft"
              @click="saveDraft"
            />
            <UButton
              label="Опубликовать"
              icon="i-lucide-check"
              color="primary"
              type="submit"
              data-testid="product-publish"
            />
          </template>
        </div>
      </div>
    </UForm>
  </div>
</template>
