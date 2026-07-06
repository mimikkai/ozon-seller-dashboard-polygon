import type { ProductCategory } from '~/types'

export const productCategories: ProductCategory[] = [
  { id: 'electronics', label: 'Электроника' },
  { id: 'electronics-phones', label: 'Телефоны', parent: 'electronics' },
  { id: 'electronics-laptops', label: 'Ноутбуки', parent: 'electronics' },
  { id: 'electronics-tablets', label: 'Планшеты', parent: 'electronics' },
  { id: 'electronics-audio', label: 'Аудио', parent: 'electronics' },
  { id: 'electronics-accessories', label: 'Аксессуары', parent: 'electronics' },
  { id: 'appliances', label: 'Бытовая техника' },
  { id: 'appliances-kitchen', label: 'Кухня', parent: 'appliances' },
  { id: 'appliances-laundry', label: 'Стирка', parent: 'appliances' },
  { id: 'appliances-climate', label: 'Климат', parent: 'appliances' },
  { id: 'clothing', label: 'Одежда' },
  { id: 'clothing-men', label: 'Мужская', parent: 'clothing' },
  { id: 'clothing-women', label: 'Женская', parent: 'clothing' },
  { id: 'clothing-kids', label: 'Детская', parent: 'clothing' },
  { id: 'clothing-shoes', label: 'Обувь', parent: 'clothing' },
  { id: 'home', label: 'Дом' },
  { id: 'home-furniture', label: 'Мебель', parent: 'home' },
  { id: 'home-kitchen', label: 'Кухня и столовая', parent: 'home' },
  { id: 'home-decor', label: 'Декор', parent: 'home' },
  { id: 'home-bedding', label: 'Постельное бельё', parent: 'home' },
  { id: 'beauty', label: 'Красота' },
  { id: 'beauty-skincare', label: 'Уход за кожей', parent: 'beauty' },
  { id: 'beauty-makeup', label: 'Макияж', parent: 'beauty' },
  { id: 'beauty-haircare', label: 'Уход за волосами', parent: 'beauty' },
  { id: 'sports', label: 'Спорт' },
  { id: 'sports-fitness', label: 'Фитнес', parent: 'sports' },
  { id: 'sports-outdoor', label: 'Активный отдых', parent: 'sports' },
  { id: 'toys', label: 'Игрушки и игры' }
]

export function getCategoryLabel(id: string): string {
  return productCategories.find(c => c.id === id)?.label ?? id
}

export function getCategoryPath(id: string): string {
  const cat = productCategories.find(c => c.id === id)
  if (!cat) return id
  if (!cat.parent) return cat.label
  const parent = productCategories.find(c => c.id === cat.parent)
  return parent ? `${parent.label} → ${cat.label}` : cat.label
}

export const categoryOptions = productCategories
  .filter(c => c.parent)
  .map(c => ({
    label: getCategoryPath(c.id),
    value: c.id
  }))
