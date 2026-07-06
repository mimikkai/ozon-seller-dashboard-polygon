import { describe, it, expect } from 'vitest'
import { productStep1Schema, productStep2Schema, productStep4Schema, productSchema } from '~/utils/productSchema'

describe('productStep1Schema', () => {
  it('requires name with at least 3 characters', () => {
    const result = productStep1Schema.safeParse({
      name: 'ab',
      offerId: 'SKU-001',
      categoryId: 'electronics-phones',
      brand: 'Brand'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('name'))).toBe(true)
    }
  })

  it('requires offerId with at least 3 characters', () => {
    const result = productStep1Schema.safeParse({
      name: 'Valid Name',
      offerId: 'ab',
      categoryId: 'electronics-phones',
      brand: 'Brand'
    })
    expect(result.success).toBe(false)
  })

  it('passes with valid data', () => {
    const result = productStep1Schema.safeParse({
      name: 'Valid Product',
      offerId: 'SKU-001',
      categoryId: 'electronics-phones',
      brand: 'Brand'
    })
    expect(result.success).toBe(true)
  })
})

describe('productStep2Schema', () => {
  it('requires price greater than 0', () => {
    const result = productStep2Schema.safeParse({
      price: 0,
      vat: '20',
      stock: 10
    })
    expect(result.success).toBe(false)
  })

  it('requires price to be a number', () => {
    const result = productStep2Schema.safeParse({
      price: 'abc',
      vat: '20',
      stock: 10
    })
    expect(result.success).toBe(false)
  })

  it('allows optional oldPrice and sku', () => {
    const result = productStep2Schema.safeParse({
      price: 4990,
      vat: '20',
      stock: 150
    })
    expect(result.success).toBe(true)
  })
})

describe('productStep4Schema', () => {
  it('requires description with at least 10 characters', () => {
    const result = productStep4Schema.safeParse({
      description: 'short'
    })
    expect(result.success).toBe(false)
  })

  it('rejects description longer than 5000 characters', () => {
    const result = productStep4Schema.safeParse({
      description: 'a'.repeat(5001)
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid description', () => {
    const result = productStep4Schema.safeParse({
      description: 'A valid product description that is long enough.'
    })
    expect(result.success).toBe(true)
  })
})

describe('productSchema (full)', () => {
  it('validates a complete product', () => {
    const result = productSchema.safeParse({
      name: 'Wireless Earbuds',
      offerId: 'SKU-EARB-001',
      categoryId: 'electronics-audio',
      brand: 'SoundWave',
      price: 4990,
      vat: '20',
      stock: 150,
      shippingTemplate: 'standard',
      packageType: 'box',
      weight: 120,
      dimensions: { length: 10, width: 8, height: 4 },
      description: 'Premium wireless earbuds with noise cancellation.'
    })
    expect(result.success).toBe(true)
  })
})
