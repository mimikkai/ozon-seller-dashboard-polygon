import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import type { Product } from '~/types'
import { productsSeed } from '~/utils/productsSeed'
import { useProducts } from '~/composables/useProducts'

vi.mock('@vueuse/core', () => ({
  useLocalStorage: (_key: string, initial: Product[]) => ref([...initial]),
  createSharedComposable: <T>(fn: () => T) => fn
}))

describe('useProducts composable', () => {
  let api: ReturnType<typeof useProducts>

  beforeEach(() => {
    api = useProducts()
  })

  it('addProduct creates product with uuid and status active', () => {
    const before = api.products.value.length
    const product = api.addProduct({
      name: 'Test Product',
      offerId: 'TEST-001',
      categoryId: 'electronics-phones',
      brand: 'TestBrand',
      price: 999,
      vat: '20',
      stock: 10,
      shippingTemplate: 'standard',
      packageType: 'box',
      weight: 100,
      dimensions: { length: 5, width: 5, height: 5 },
      description: 'A test product description.'
    })

    expect(product.id).toBeTruthy()
    expect(product.status).toBe('active')
    expect(product.name).toBe('Test Product')
    expect(api.products.value.length).toBe(before + 1)
  })

  it('updateProduct modifies fields', () => {
    const product = api.addProduct({
      name: 'Original Name',
      offerId: 'TEST-002',
      categoryId: 'electronics-phones',
      brand: 'TestBrand',
      price: 999,
      vat: '20',
      stock: 10,
      shippingTemplate: 'standard',
      packageType: 'box',
      weight: 100,
      dimensions: { length: 5, width: 5, height: 5 },
      description: 'A test product description.'
    })

    api.updateProduct(product.id, { name: 'Updated Name', price: 1999 })

    const updated = api.getProduct(product.id)
    expect(updated?.name).toBe('Updated Name')
    expect(updated?.price).toBe(1999)
  })

  it('deleteProduct removes by id', () => {
    const before = api.products.value.length
    const product = api.addProduct({
      name: 'To Delete',
      offerId: 'TEST-003',
      categoryId: 'electronics-phones',
      brand: 'TestBrand',
      price: 999,
      vat: '20',
      stock: 10,
      shippingTemplate: 'standard',
      packageType: 'box',
      weight: 100,
      dimensions: { length: 5, width: 5, height: 5 },
      description: 'A test product description.'
    })

    api.deleteProduct(product.id)
    expect(api.products.value.length).toBe(before)
    expect(api.getProduct(product.id)).toBeNull()
  })

  it('resetPolygon restores seed', () => {
    api.addProduct({
      name: 'Extra Product',
      offerId: 'TEST-004',
      categoryId: 'electronics-phones',
      brand: 'TestBrand',
      price: 999,
      vat: '20',
      stock: 10,
      shippingTemplate: 'standard',
      packageType: 'box',
      weight: 100,
      dimensions: { length: 5, width: 5, height: 5 },
      description: 'A test product description.'
    })

    expect(api.products.value.length).toBeGreaterThan(productsSeed.length)

    api.resetPolygon()
    expect(api.products.value.length).toBe(productsSeed.length)
  })

  it('getProduct returns correct product or null', () => {
    expect(api.getProduct('nonexistent-id')).toBeNull()

    const seedProduct = productsSeed[0]
    if (seedProduct) {
      const found = api.getProduct(seedProduct.id)
      expect(found).not.toBeNull()
      expect(found?.name).toBe(seedProduct.name)
    }
  })
})
