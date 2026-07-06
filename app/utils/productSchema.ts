import * as z from 'zod'

const LOG_LEVEL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.LOG_LEVEL || 'debug' : 'debug'

function debug(message: string, data?: unknown) {
  if (LOG_LEVEL === 'debug') {
    console.debug(`[productSchema] ${message}`, data ?? '')
  }
}

export const productStep1Schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  offerId: z.string().min(3, 'Article must be at least 3 characters'),
  categoryId: z.string().min(1, 'Select a category'),
  brand: z.string().min(2, 'Brand must be at least 2 characters')
})

export const productStep2Schema = z.object({
  price: z.number({ message: 'Enter a number' }).positive('Price must be greater than 0'),
  oldPrice: z.number().positive('Old price must be greater than 0').optional(),
  vat: z.enum(['0', '10', '20']),
  stock: z.number({ message: 'Enter a number' }).int().min(0, 'Stock cannot be negative'),
  sku: z.string().optional()
})

export const productStep3Schema = z.object({
  shippingTemplate: z.enum(['standard', 'express', 'pickup', 'heavy']),
  packageType: z.enum(['box', 'bag', 'envelope', 'pallet']),
  weight: z.number({ message: 'Enter a number' }).positive('Weight must be greater than 0'),
  dimensions: z.object({
    length: z.number({ message: 'Enter a number' }).positive('Length must be greater than 0'),
    width: z.number({ message: 'Enter a number' }).positive('Width must be greater than 0'),
    height: z.number({ message: 'Enter a number' }).positive('Height must be greater than 0')
  })
})

export const productStep4Schema = z.object({
  description: z.string().max(5000, 'Description must be at most 5000 characters').min(10, 'Description must be at least 10 characters'),
  mainImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  gallery: z.array(z.string().url('Must be a valid URL')).optional()
})

export const productSchema = productStep1Schema
  .extend(productStep2Schema.shape)
  .extend(productStep3Schema.shape)
  .extend(productStep4Schema.shape)

export type ProductStep1 = z.output<typeof productStep1Schema>
export type ProductStep2 = z.output<typeof productStep2Schema>
export type ProductStep3 = z.output<typeof productStep3Schema>
export type ProductStep4 = z.output<typeof productStep4Schema>
export type ProductInput = z.output<typeof productSchema>

debug('productSchema initialized', { stepCount: 4 })
