<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
import type { Product } from '~/types'
import { getCategoryLabel } from '~/utils/productCategories'
import { statusLabels, statusColors } from '~/utils/statusLabels'

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const LOG_LEVEL = import.meta.env.LOG_LEVEL || 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[products.vue] ${message}`, data ?? '')
  }
}

const toast = useToast()
const router = useRouter()
const table = useTemplateRef('table')

const { products, deleteProduct, deleteProducts } = useProducts()

useHead({
  title: 'Товары — Seller Marketplace'
})

const columnFilters = ref([{
  id: 'name',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})
const statusFilter = ref('all')

watch(() => statusFilter.value, (newVal) => {
  debug('status filter changed', { value: newVal })
  if (!table?.value?.tableApi) return

  const statusColumn = table.value.tableApi.getColumn('status')
  if (!statusColumn) return

  if (newVal === 'all') {
    statusColumn.setFilterValue(undefined)
  } else {
    statusColumn.setFilterValue(newVal)
  }
})

const searchQuery = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn('name')?.getFilterValue() as string) || ''
  },
  set: (value: string) => {
    debug('search changed', { value })
    table.value?.tableApi?.getColumn('name')?.setFilterValue(value || undefined)
  }
})

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value)
}

function getRowItems(row: Row<Product>) {
  return [
    {
      type: 'label',
      label: 'Действия'
    },
    {
      label: 'Редактировать',
      icon: 'i-lucide-pencil',
      onSelect() {
        debug('row action: edit', { id: row.original.id })
        router.push(`/products/${row.original.id}`)
      }
    },
    {
      label: 'Дублировать',
      icon: 'i-lucide-copy',
      onSelect() {
        debug('row action: duplicate', { id: row.original.id })
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = row.original
        const newProduct = useProducts().addProduct({ ...rest, name: `${row.original.name} (копия)` })
        toast.add({
          title: 'Товар дублирован',
          description: `Создана копия «${newProduct.name}»`,
          color: 'success'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Удалить',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        debug('row action: delete', { id: row.original.id })
        deleteProduct(row.original.id)
        toast.add({
          title: 'Товар удалён',
          description: `«${row.original.name}» удалён.`,
          color: 'error'
        })
      }
    }
  ]
}

const columns: TableColumn<Product>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  {
    accessorKey: 'name',
    header: 'Название',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, {
          src: row.original.mainImage,
          alt: row.original.name,
          size: 'lg',
          icon: 'i-lucide-package'
        }),
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.name),
          h('p', { class: 'text-muted text-sm' }, row.original.offerId)
        ])
      ])
    }
  },
  {
    accessorKey: 'categoryId',
    header: 'Категория',
    cell: ({ row }) => getCategoryLabel(row.original.categoryId)
  },
  {
    accessorKey: 'brand',
    header: 'Бренд',
    cell: ({ row }) => row.original.brand
  },
  {
    accessorKey: 'price',
    header: 'Цена',
    cell: ({ row }) => formatPrice(row.original.price),
    sortingFn: 'alphanumeric'
  },
  {
    accessorKey: 'stock',
    header: 'Остаток',
    cell: ({ row }) => row.original.stock
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    filterFn: 'equals',
    cell: ({ row }) => {
      const color = statusColors[row.original.status]
      return h(UBadge, { variant: 'subtle', color }, () =>
        statusLabels[row.original.status]
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

function navigateToNew() {
  debug('navigate to /products/new')
  router.push('/products/new')
}

function deleteSelected() {
  const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows ?? []
  const ids = selectedRows.map(r => r.original.id)
  debug('delete selected', { count: ids.length })
  deleteProducts(ids)
  toast.add({
    title: 'Товары удалены',
    description: `${ids.length} товар(ов) удалено.`,
    color: 'error'
  })
}
</script>

<template>
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar title="Товары">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Новый товар"
            icon="i-lucide-plus"
            color="primary"
            class="rounded-full"
            data-testid="products-new-button"
            @click="navigateToNew"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="searchQuery"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Поиск товаров..."
          data-testid="products-search"
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <UButton
            v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
            label="Удалить"
            color="error"
            variant="subtle"
            icon="i-lucide-trash"
            data-testid="products-delete-selected"
            @click="deleteSelected"
          >
            <template #trailing>
              <UKbd>
                {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
              </UKbd>
            </template>
          </UButton>

          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'Все', value: 'all' },
              { label: 'Активные', value: 'active' },
              { label: 'На модерации', value: 'pending' },
              { label: 'Черновики', value: 'draft' },
              { label: 'Отклонённые', value: 'rejected' }
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Фильтр по статусу"
            class="min-w-28"
            data-testid="products-status-filter"
          />
        </div>
      </div>

      <ClientOnly>
        <UTable
          ref="table"
          v-model:column-filters="columnFilters"
          v-model:column-visibility="columnVisibility"
          v-model:row-selection="rowSelection"
          v-model:pagination="pagination"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }"
          class="shrink-0"
          :data="products"
          :columns="columns"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0'
          }"
          :row-attr="(row: Product) => ({ 'data-testid': `products-row-${row.id}` })"
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center py-12 gap-3" data-testid="products-empty-state">
              <UIcon name="i-lucide-package-x" class="size-12 text-dimmed" />
              <p class="text-muted">
                Нет товаров. Создайте первый товар.
              </p>
              <UButton
                label="Новый товар"
                icon="i-lucide-plus"
                color="primary"
                @click="navigateToNew"
              />
            </div>
          </template>
        </UTable>

        <template #fallback>
          <div class="flex items-center justify-center py-12">
            <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-dimmed" />
          </div>
        </template>
      </ClientOnly>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} из
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} строк выбрано.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
