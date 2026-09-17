'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  productName: string
  price: number
}

export function WhatsAppButton({ productName, price }: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    const phoneNumber = '56912345678'
    const message = `Hola, me interesa comprar ${productName} ($${price.toLocaleString('es-CL')}) que vi en su página web.`
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="inline-flex items-center justify-center gap-2 w-full bg-[#22C55E] hover:bg-[#16a34a] text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
    >
      <MessageCircle className="w-5 h-5" />
      Consultar por WhatsApp
    </button>
  )
}