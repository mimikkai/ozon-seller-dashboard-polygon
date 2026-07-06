import { createSharedComposable, useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { Product, ProductStatus } from '~/types'
import { productsSeed } from '~/utils/productsSeed'

const LOG_LEVEL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.LOG_LEVEL || 'debug' : 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[useProducts] ${message}`, data ?? '')
  }
}

function generateId(): string {
  debug('generateId called')
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `prod-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function _useProducts() {
  const storageKey = 'smp:products'
  debug('initializing useProducts', { storageKey })

  const products = useLocalStorage<Product[]>(storageKey, productsSeed)

  const productCount = computed(() => products.value.length)

  function addProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string, status?: ProductStatus, createdAt?: string, updatedAt?: string }): Product {
    debug('addProduct START', { name: data.name, offerId: data.offerId })
    const now = new Date().toISOString()
    const product: Product = {
      ...data,
      id: data.id ?? generateId(),
      status: data.status ?? 'active',
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now
    }
    debug('addProduct constructed', { id: product.id, status: product.status })
    products.value = [...products.value, product]
    debug('addProduct END', { total: products.value.length })
    return product
  }

  function updateProduct(id: string, data: Partial<Product>): void {
    debug('updateProduct START', { id, fields: Object.keys(data) })
    const index = products.value.findIndex(p => p.id === id)
    if (index === -1) {
      console.warn('[useProducts] updateProduct: product not found', { id })
      return
    }
    const updated: Product = {
      ...products.value[index]!,
      ...data,
      updatedAt: new Date().toISOString()
    }
    debug('updateProduct merged', { id, changedFields: Object.keys(data) })
    const next = [...products.value]
    next[index] = updated
    products.value = next
    debug('updateProduct END', { id })
  }

  function deleteProduct(id: string): void {
    debug('deleteProduct START', { id })
    products.value = products.value.filter(p => p.id !== id)
    debug('deleteProduct END', { remaining: products.value.length })
  }

  function deleteProducts(ids: string[]): void {
    debug('deleteProducts START', { count: ids.length })
    const idSet = new Set(ids)
    products.value = products.value.filter(p => !idSet.has(p.id))
    debug('deleteProducts END', { remaining: products.value.length })
  }

  function getProduct(id: string): Product | null {
    debug('getProduct', { id })
    return products.value.find(p => p.id === id) ?? null
  }

  function resetPolygon(): void {
    debug('resetPolygon START')
    products.value = [...productsSeed]
    debug('resetPolygon END', { count: products.value.length })
  }

  return {
    products,
    productCount,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    getProduct,
    resetPolygon
  }
}

export const useProducts = createSharedComposable(_useProducts)
