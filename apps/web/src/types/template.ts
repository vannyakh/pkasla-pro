export interface Template {
  id: string
  name: string
  title: string
  category?: string
  price?: number
  isPremium: boolean
  previewImage?: string
  slug?: string // Next.js route name (e.g., "classic-gold", "modern-minimal")
  variables?: string[] // Available variables (e.g., ["event.title", "guest.name", "event.date"])
  assets?: {
    images?: string[]
    colors?: string[]
    fonts?: string[]
  }
  createdAt: string
  updatedAt?: string
}

export interface TemplateFormData {
  name: string
  title: string
  category: string
  price: number | ''
  isPremium: boolean
  previewImage: File | string | null
  slug?: string
  variables?: string[]
  assets?: {
    images?: string[]
    colors?: string[]
    fonts?: string[]
  }
}

export interface TemplateListResponse {
  items: Template[]
  total: number
  page: number
  pageSize: number
}

