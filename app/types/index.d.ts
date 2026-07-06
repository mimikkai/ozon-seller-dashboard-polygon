export type ProductStatus = 'draft' | 'pending' | 'active' | 'rejected'

export type VatRate = '0' | '10' | '20'

export type ShippingTemplate = 'standard' | 'express' | 'pickup' | 'heavy'

export type PackageType = 'box' | 'bag' | 'envelope' | 'pallet'

export interface ProductDimensions {
  length: number
  width: number
  height: number
}

export interface Product {
  id: string
  name: string
  offerId: string
  categoryId: string
  brand: string
  price: number
  oldPrice?: number
  vat: VatRate
  stock: number
  sku?: string
  shippingTemplate: ShippingTemplate
  packageType: PackageType
  weight: number
  dimensions: ProductDimensions
  description: string
  mainImage?: string
  gallery?: string[]
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  label: string
  parent?: string
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
