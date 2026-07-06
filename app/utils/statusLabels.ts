import type { ProductStatus } from '~/types'

export const statusLabels: Record<ProductStatus, string> = {
  draft: 'Черновик',
  pending: 'На модерации',
  active: 'Активен',
  rejected: 'Отклонён'
}

export const statusColors: Record<ProductStatus, 'neutral' | 'warning' | 'success' | 'error'> = {
  draft: 'neutral',
  pending: 'warning',
  active: 'success',
  rejected: 'error'
}

export function getStatusLabel(status: ProductStatus): string {
  return statusLabels[status]
}
