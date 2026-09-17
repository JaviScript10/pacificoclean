import Image from 'next/image'
import Link from 'next/link'
import { WhatsAppButton } from '@/components/whatsapp-button'

// Definimos los tipos aquí mismo de forma local y autónoma
export interface Category {
  id: string
  name: string
  slug: string
  image_url?: string | null
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  position: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  stock: number
  category_id?: string | null
  is_active: boolean
  is_featured: boolean
  is_offer: boolean
  created_at: string
  categories?: Category
  product_images?: ProductImage[]
}

export function ProductCard({ product }: { product: Product }) {
  const mainImage = product.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&q=80&w=600'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
        <Image 
          src={mainImage} 
          alt={product.name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {product.is_offer && (
          <span className="absolute top-3 left-3 bg-[#22C55E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            Oferta
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
          {product.categories?.name || 'Aseo General'}
        </span>
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-gray-500 text-sm mt-1 line-clamp-2 flex-grow">
          {product.description || 'Producto de alto rendimiento para limpieza institucional y del hogar.'}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-black text-[#0A74DA]">
            ${product.price.toLocaleString('es-CL')}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
            Stock: {product.stock}
          </span>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <WhatsAppButton productName={product.name} price={product.price} />
        </div>
      </div>
    </div>
  )
}