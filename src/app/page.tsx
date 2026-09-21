'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Analytics } from '@vercel/analytics/react'
import {
  Phone,
  Mail,
  Instagram,
  MessageCircle,
  ShieldCheck,
  MapPin,
  ExternalLink,
  HelpCircle,
  FileText,
  CheckCircle2,
  Menu,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Navigation,
  ChevronDown,
  ArrowLeft
} from 'lucide-react'

// Componente Cliente para el Logo con Scroll Suave Infalible
function LogoButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="flex items-center gap-2 sm:gap-4 group text-left bg-transparent border-none cursor-pointer p-0"
    >
      <div className="relative w-14 h-14 sm:w-22 sm:h-22 flex items-center justify-center overflow-hidden bg-white rounded-2xl border border-neutral-300 p-2 transition-transform group-hover:scale-105 shadow-md flex-shrink-0">
        <Image 
          src="/logo.png" 
          alt="PacificoClean Logo" 
          fill 
          className="object-contain drop-shadow-md"
        />
      </div>
      <div>
        <span className="text-xl sm:text-3xl font-black tracking-tight text-blue-300 drop-shadow-sm">
          Pacífico<span className="text-blue-500">Clean</span>
        </span>
        <span className="block text-[9px] sm:text-xs tracking-widest uppercase text-neutral-400 font-bold">
          Aseo Profesional
        </span>
      </div>
    </button>
  )
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  
  // Estado para el modal de imagen (Lightbox)
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null)

  // Estado para el carrito y formulario de despacho
  const [cart, setCart] = useState<{ name: string; price: number; qty: number; img: string }[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Estado para manejar las variantes seleccionadas en productos múltiples
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: number }>({})

  // Datos del cliente para envío
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientCity, setClientCity] = useState('Valparaíso')

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.getElementById(targetId)
    if (element) {
      const headerOffset = 96
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Funciones del Carrito
  const addToCart = (product: { name: string; price: number; img: string; variants?: { name: string; price: number }[] }, productId: string) => {
    let finalName = product.name
    let finalPrice = product.price

    if (product.variants && product.variants.length > 0) {
      const variantIndex = selectedVariants[productId] || 0
      const chosenVariant = product.variants[variantIndex]
      finalName = `${product.name} (${chosenVariant.name})`
      finalPrice = chosenVariant.price
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.name === finalName)
      if (existing) {
        return prevCart.map(item => 
          item.name === finalName ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prevCart, { name: finalName, price: finalPrice, qty: 1, img: product.img }]
    })
    setIsCartOpen(true)
  }

  const updateQty = (name: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.name === name) {
          const newQty = item.qty + delta
          return newQty > 0 ? { ...item, qty: newQty } : null
        }
        return item
      }).filter(Boolean) as typeof prevCart
    })
  }

  const removeFromCart = (name: string) => {
    setCart(prevCart => prevCart.filter(item => item.name !== name))
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

  const getShippingCost = () => {
    if (clientCity === 'Valparaíso') return 0
    if (clientCity === 'Viña del Mar') return 2000
    if (clientCity === 'Concón') return 3000
    if (clientCity === 'Quilpué') return 3000
    return 0
  }

  const shippingCost = getShippingCost()
  const finalTotal = subtotalCartPrice + (cart.length > 0 ? shippingCost : 0)

// Estado para alertas de error en el formulario de despacho
  const [formError, setFormError] = useState('')

const checkoutWhatsApp = () => {
    if (cart.length === 0) return

    // Validar que los campos obligatorios no estén vacíos
    if (!clientName.trim() || !clientPhone.trim() || !clientAddress.trim()) {
      setFormError('⚠️ Por favor, rellena todos los campos de entrega (Nombre, Teléfono y Dirección) antes de enviar el pedido.')
      return
    }

    setFormError('') // Limpiar error si todo está OK

    let message = `NUEVO PEDIDO / COTIZACION - PacificoClean\n\n`
    message += `Cliente: ${clientName}\n`
    message += `Telefono: ${clientPhone}\n`
    message += `Direccion: ${clientAddress}\n`
    message += `Ciudad / Comuna: ${clientCity} (Despacho: ${shippingCost === 0 ? 'GRATIS' : '$' + shippingCost.toLocaleString('es-CL')})\n\n`
    message += `Detalle de Productos:\n`
    cart.forEach(item => {
      message += `- ${item.qty}x ${item.name} ($${(item.price * item.qty).toLocaleString('es-CL')})\n`
    })
    message += `\nSubtotal: $${subtotalCartPrice.toLocaleString('es-CL')}`
    message += `\nCosto Despacho: ${shippingCost === 0 ? 'GRATIS' : '$' + shippingCost.toLocaleString('es-CL')}`
    message += `\nTOTAL FINAL: $${finalTotal.toLocaleString('es-CL')}\n\nHay stock disponible para coordinar la entrega?`
    
    const encoded = encodeURIComponent(message)
    const url = `https://wa.me/56959406597?text=${encoded}`
    
    // Detección automática: Si es dispositivo móvil abre directo, si es PC abre pestaña nueva
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      window.location.href = url // En celu abre la app directo sin pestañas en blanco
    } else {
      window.open(url, '_blank') // En PC abre WhatsApp Web en una pestaña nueva y mantiene tu tienda abierta
    }
  }

  // Lista completa de productos con correcciones aplicadas
  const productos = [
    // --- OFERTAS & FIESTAS PATRIAS ---
    { id: 'off-1', name: 'Limpia Piso aroma primavera 2 litros', price: 1500, cat: 'Ofertas', badge: '¡Oferta!', img: '/images/oferta-limpia piso-2LT-1.500-.png' },
    { id: 'off-2', name: 'Desengrasante 1 litro marca Glim', price: 1500, cat: 'Ofertas', badge: '¡Oferta!', img: '/images/oferta-desengrasante-1litro-glim.png' },
    { id: 'off-3', name: 'Papel Higiénico Manga 48 rollos (22m c/u)', price: 9000, originalPrice: 10990, cat: 'Ofertas', badge: 'Super Promo', img: '/images/manga-floral-48rollos.png' },
    { id: 'off-4', name: 'Alcohol Etílico 5 Litros', price: 13990, originalPrice: 15990, cat: 'Ofertas', badge: 'Descuento', img: '/images/oferta-alcohol-etilico-5lt.png' },
    { id: 'off-5', name: 'Limpia Vidrios Multiuso Glim', price: 1500, cat: 'Ofertas', badge: '¡Oferta!', img: '/images/limpavidrios-promos.png', variants: [
      { name: '1 Litro', price: 1500 },
      { name: '3 Litros', price: 3000 }
    ]},

    // --- DETERGENTES Y LAVADO ---
    { id: 'det-1', name: 'Detergente en Polvo Virginia (400 gr)', price: 1350, cat: 'Detergentes', img: '/images/detergente-polvo-virginia-400GR.png' },
    { id: 'det-2', name: 'Detergente Líquido Flash Multiacción (5 Litros)', price: 4000, cat: 'Detergentes', img: '/images/detergente-flash-multiaccion-5litros.png' },
    { id: 'det-3', name: 'Detergente Líquido Flash Perlado (5 Litros)', price: 3500, cat: 'Detergentes', img: '/images/detergente-flash-perlado-5litros.png' },
    { id: 'det-4', name: 'Suavizante de Ropa Flash (5 Litros)', price: 4000, cat: 'Detergentes', img: '/images/suavizante-ropa-flash-5litros.png' },
    { id: 'det-5', name: 'Detergente Enzimático Uklean (5 Litros)', price: 25000, cat: 'Detergentes', badge: 'Enzimático', img: '/images/detergente-unklean-enzimatico-5litros.png' },
    { id: 'det-6', name: 'Detergente Ultraprox Penta Enzimático (5 Litros)', price: 15000, cat: 'Detergentes', badge: 'Penta', img: '/images/detergente-ultraprox-penta-enzimatico-5 litros.png' },

    // --- JABÓN Y LAVALOZAS ---
    { id: 'jab-1', name: 'Jabón Líquido para Manos con Glicerina (5 Litros)', price: 4800, cat: 'Jabón y Lavalozas', img: '/images/jabon-liquido-manos-5litros.png' },
    { id: 'jab-2', name: 'Lavalozas Magistral (750 ml)', price: 4990, cat: 'Jabón y Lavalozas', img: '/images/lavalozas-magistral-750ML.png' },
    { id: 'jab-3', name: 'Lavalozas Ultra Power Glim (5 Litros)', price: 4000, cat: 'Jabón y Lavalozas', img: '/images/lavalozas-glim-ultrapower-5litros.png' },
    { id: 'jab-4', name: 'Lavalozas Don Tito (5 Litros)', price: 4000, cat: 'Jabón y Lavalozas', img: '/images/lavalozas-tito-5litros.png' },

    // --- LIMPIEZA DE SUPERFICIES Y PISOS (Cera Incolora corregida) ---
    { id: 'lim-1', name: 'Desengrasante Glim', price: 1990, cat: 'Limpieza', img: '/images/desengrasante-glim-1litro.png', variants: [
      { name: '1 Litro', price: 1990 },
      { name: '5 Litros', price: 5000 }
    ]},
    { id: 'lim-2', name: 'Limpia Pisos RO Lavanda (5 Litros)', price: 3000, cat: 'Limpieza', img: '/images/limpia-pisos-RO-lavanda-5litros.png' },
    { id: 'lim-3', name: 'Limpia Pisos Excell (900 ml)', price: 1400, cat: 'Limpieza', img: '/images/limpiapisos-excell-900ML.png' },
    { id: 'lim-4', name: 'Limpia Pisos Glim', price: 1750, cat: 'Limpieza', img: '/images/limpia-pisos-GLIM-2litros.png', variants: [
      { name: '2 Litros', price: 1750 },
      { name: '5 Litros', price: 3000 }
    ]},
    { id: 'lim-5', name: 'Crema Multiuso Virutex (500 ml)', price: 1800, cat: 'Limpieza', img: '/images/crema-virutex-500ML.png' },
    { id: 'lim-6', name: 'Limpiador en Crema Excell (750 gr)', price: 2100, cat: 'Limpieza', img: '/images/limpiador-crema-excell-750GR.png' },
    { id: 'lim-7', name: 'Cera Incolora', price: 2800, cat: 'Limpieza', img: '/images/cera-icolora-1LT.png', variants: [
      { name: '1 Litro', price: 2800 },
      { name: '5 Litros', price: 9000 }
    ]},
    { id: 'lim-8', name: 'Lustra Muebles Virginia (250 ml)', price: 1600, cat: 'Limpieza', img: '/images/lustra-mueble-virginia-250ML.png' },

    // --- CLORO Y DESINFECTANTES ---
    { id: 'clo-1', name: 'Cloro Smart Wash (1 Litro)', price: 1150, cat: 'Cloro y Desinfectantes', img: '/images/cloro-smart-wash-1litro.png' },
    { id: 'clo-2', name: 'Cloro Flash Concentrado (5 Litros)', price: 2600, cat: 'Cloro y Desinfectantes', img: '/images/cloro-flash-5 litros.png' },
    { id: 'clo-3', name: 'Clorogel Relux (5 Litros)', price: 4250, cat: 'Cloro y Desinfectantes', img: '/images/clorogel-relux-5litros.png' },
    { id: 'clo-4', name: 'Clorogel Glim (1 Litro)', price: 1200, cat: 'Cloro y Desinfectantes', img: '/images/clorogel glim-1litro.png' },
    { id: 'clo-5', name: 'Clorogel Igenix (900 ml)', price: 1490, cat: 'Cloro y Desinfectantes', img: '/images/clorogel-igenix-900ML.png' },
    { id: 'clo-6', name: 'Clorogel Excell (900 ml)', price: 1490, cat: 'Cloro y Desinfectantes', img: '/images/clorogel-excell-900ML.png' },
    { id: 'clo-7', name: 'Toallas con Cloro Virutex (90 Unidades)', price: 4500, cat: 'Cloro y Desinfectantes', img: '/images/toalla-cloro-virutex-90UN.png' },
    { id: 'clo-8', name: 'Toallas Desinfectantes Clorox (50 Unidades)', price: 3000, cat: 'Cloro y Desinfectantes', img: '/images/toalla-clorox-50UN.png' },
    { id: 'clo-9', name: 'Desinfectante Aerosol Igenix (360 cc)', price: 2900, cat: 'Cloro y Desinfectantes', img: '/images/desinfectante-igenix-360CC.png' },
    { id: 'clo-10', name: 'Desinfectante Antibacterial (360 cc)', price: 2600, cat: 'Cloro y Desinfectantes', img: '/images/desinfectante-antibac-360CC.png' },
    { id: 'clo-11', name: 'Insecticida Killer Todo Insecto Casa y Jardín (390 ml)', price: 2390, cat: 'Cloro y Desinfectantes', img: '/images/insecticida-killer-casa-jardin.png' },
    { id: 'clo-12', name: 'Desodorante Ambiental Ultraprox Brisa Marina (5 Litros)', price: 9000, cat: 'Cloro y Desinfectantes', img: '/images/desodorante-ambiental-ultraprox-5litros-brisa marina.png' },
    { id: 'clo-13', name: 'Amonio Cuaternario Winkler (5 Litros)', price: 7000, cat: 'Cloro y Desinfectantes', img: '/images/amonio-cuaternario-5litros-winkler.png' },
    { id: 'clo-14', name: 'Alcohol Etílico Ultrax 70% (1 Litro)', price: 3600, cat: 'Cloro y Desinfectantes', img: '/images/alcohol-etilico-ultrax-70-1litro.png' },
    { id: 'clo-15', name: 'Alcohol Ultra 70% (5 Litros)', price: 15900, cat: 'Cloro y Desinfectantes', img: '/images/alcohol-ultra-70-5litros.png' },
    { id: 'clo-16', name: 'Alcohol Gel (5 Litros)', price: 13900, cat: 'Cloro y Desinfectantes', img: '/images/alcohol-gel-5litros.png' },

    // --- BOLSAS Y ACCESORIOS ---
    { id: 'bol-1', name: 'Bolsas de Basura 50x65 cm con Asas Virutex (10 Unidades)', price: 480, cat: 'Bolsas y Accesorios', img: '/images/bolsas-50x65cm-con asas.png' },
    { id: 'bol-2', name: 'Bolsas de Basura 50x70 cm', price: 500, cat: 'Bolsas y Accesorios', img: '/images/bolsa50x70.png' },
    { id: 'bol-3', name: 'Bolsas de Basura 70x90 cm', price: 900, cat: 'Bolsas y Accesorios', img: '/images/bolsa-70x90cm.png' },
    { id: 'bol-4', name: 'Bolsas de Basura 80x110 cm', price: 1200, cat: 'Bolsas y Accesorios', img: '/images/bolsa-80x110.png' },
    { id: 'bol-5', name: 'Bolsas de Basura 90x120 cm', price: 2100, cat: 'Bolsas y Accesorios', img: '/images/bolsa90x120cm.png' },
    { id: 'bol-6', name: 'Bolsas Pack 100 Unidades', price: 3500, cat: 'Bolsas y Accesorios', badge: 'Medidas', img: '/images/bolsa-100unidades.png', variants: [
      { name: 'Medida 40x50', price: 3500 },
      { name: 'Medida 45x55', price: 4500 },
      { name: 'Medida 50x60', price: 5500 },
      { name: 'Medida 60x70', price: 8000 }
    ]},
    { id: 'bol-7', name: 'Bolsas Contenedoras Gigantes (10 Unidades)', price: 5990, cat: 'Bolsas y Accesorios', badge: 'Pack', img: '/images/bolsa-120x120cm-140x1400cm.png', variants: [
      { name: '120x120 cm', price: 5990 },
      { name: '140x140 cm', price: 8990 }
    ]},
    { id: 'bol-8', name: 'Esponjas de Aseo', price: 200, cat: 'Bolsas y Accesorios', badge: 'Variedad', img: '/images/esponjas.png', variants: [
      { name: 'Esponja Bakan', price: 200 },
      { name: 'Esponja Virutex', price: 300 },
      { name: 'Esponja Inox Virutex (2 Unidades)', price: 2350 },
      { name: 'Esponja Scrub Power Virutex', price: 1350 }
    ]},
    { id: 'bol-9', name: 'Guantes de Goma para Aseo', price: 1100, cat: 'Bolsas y Accesorios', img: '/images/guantes-goma-tallaMyL.png', variants: [
      { name: 'Talla M', price: 1100 },
      { name: 'Talla L', price: 1100 }
    ]},
    { id: 'bol-10', name: 'Repuesto de Mopa de Algodón (9 Oz)', price: 3000, cat: 'Bolsas y Accesorios', img: '/images/repuesto-mopa-algodon-9OZ.png' },
    { id: 'bol-11', name: 'Palas y Escobas Profesionales', price: 1000, cat: 'Bolsas y Accesorios', badge: 'Variedad', img: '/images/palas-escobas.png', variants: [
      { name: 'Pala plástica', price: 1000 },
      { name: 'Pala plástica Aileda', price: 2500 },
      { name: 'Mopa algodón con mango', price: 3900 },
      { name: 'Escoba mango madera Virutex', price: 3900 }
    ]},
    { id: 'bol-12', name: 'Paños Multiuso y Absorbentes', price: 300, cat: 'Bolsas y Accesorios', badge: 'Variedad', img: '/images/pañosmultiuso.png', variants: [
      { name: 'Paño 3 unidades', price: 2000 },
      { name: 'Paño multiuso amarillo (c/u)', price: 300 },
      { name: 'Paño microfibra 40x40 cm (c/u)', price: 500 },
      { name: 'Trapero microfibra con ojal 50x70 cm (c/u)', price: 1100 }
    ]},
    { id: 'bol-13', name: 'Caja de Pañuelos Desechables Bless (90 Unidades)', price: 1000, cat: 'Bolsas y Accesorios', img: '/images/pañuelos-90unidades-bless.png' },
    { id: 'bol-14', name: 'Algodón Hidrófilo Win (250 gr)', price: 2900, cat: 'Bolsas y Accesorios', img: '/images/algodon-250GM-WIN.png' },
    { id: 'bol-15', name: 'Guantes de Vinilo (Caja 100 Unidades)', price: 3000, cat: 'Bolsas y Accesorios', img: '/images/guantes-vinilo-100UN.png' },
    { id: 'bol-16', name: 'Guantes de Nitrilo Negro (Caja 100 Unidades)', price: 5000, cat: 'Bolsas y Accesorios', img: '/images/guantes-nitrilo-negro-100UN.png' },
    { id: 'bol-17', name: 'Cofias Desechables Blancas (100 Unidades)', price: 5000, cat: 'Bolsas y Accesorios', img: '/images/cofias-100UN.png' },

    // --- PAPEL HIGIÉNICO / TOALLAS DE PAPEL ---
    { id: 'pap-1', name: 'Trapero Húmedo (Pack 10 Unidades)', price: 2000, cat: 'Papel Higiénico / Toallas de Papel', img: '/images/trapero-humedo-10UN.png' },
    { id: 'pap-2', name: 'Toallas Húmedas Baby (80 Unidades)', price: 1600, cat: 'Papel Higiénico / Toallas de Papel', img: '/images/toalla-humeda-baby-80UN.png' },
    { id: 'pap-3', name: 'Toallas de Papel y Sabanillas', price: 4500, cat: 'Papel Higiénico / Toallas de Papel', badge: 'Promos', img: '/images/toallapapel.png', variants: [
      { name: 'Sabanillas 2 mts prepicadas - 2 rollos 48 mts', price: 5000 },
      { name: 'Toalla de papel interfoliada - 200 unidades', price: 1500 },
      { name: 'Toalla de papel interfoliada Elite - 200 unidades', price: 1700 }
    ]},
    { id: 'pap-4', name: 'Toallas de Papel (Variedad)', price: 1500, cat: 'Papel Higiénico / Toallas de Papel', badge: 'Variedad', img: '/images/toallapapel2.png', variants: [
      { name: 'Toalla de papel 2 rollos - 200 mts c/u', price: 7990 },
      { name: 'Toalla de papel industrial 4 rollos - 200 mts c/u', price: 12000 },
      { name: 'Toalla prepicada Elite - 2 rollos (20 mts c/u)', price: 2450 },
      { name: 'Toalla prepicada Elite - 20 rollos (20 mts c/u)', price: 24500 },
      { name: 'Toalla prepicada Nova - 3 rollos (12 mts c/u)', price: 1500 }
    ]},
    { id: 'pap-5', name: 'Papel Higiénico Florax', price: 1000, cat: 'Papel Higiénico / Toallas de Papel', img: '/images/papel-higienico-FLORAX-20MT-PROMO.png', variants: [
      { name: '4 Rollos (20 metros)', price: 1000 },
      { name: 'Manga 48 Rollos', price: 10990 }
    ]},
    { id: 'pap-6', name: 'Papel Higiénico Confort Doble Hoja', price: 1200, cat: 'Papel Higiénico / Toallas de Papel', badge: 'Variedad', img: '/images/papel-higienico-confort-22MT.png', variants: [
      { name: '4 Rollos (22 metros)', price: 1200 },
      { name: '4 Rollos (30 metros)', price: 1400 },
      { name: 'Manga 48 Rollos (22 mts)', price: 12990 },
      { name: 'Manga 48 Rollos (30 mts)', price: 14990 }
    ]},
    { id: 'pap-7', name: 'Papel Higiénico Swan Ultra Blanco', price: 1400, cat: 'Papel Higiénico / Toallas de Papel', img: '/images/papel-higienico-SWAN-30 metros.png', variants: [
      { name: '4 Rollos (30 metros)', price: 1400 },
      { name: 'Manga 48 Rollos', price: 14990 }
    ]},
    { id: 'pap-8', name: 'Papel Higiénico Industrial (6 Rollos de 300 Metros)', price: 8000, cat: 'Papel Higiénico / Toallas de Papel', img: '/images/papel-higienico-industrial-6 rollos-300MT.png' },
    { id: 'pap-9', name: 'Servilletas de Papel', price: 1500, cat: 'Papel Higiénico / Toallas de Papel', badge: 'Variedad', img: '/images/servilletas.png', variants: [
      { name: 'Paquete 300 unidades (17x17 cm)', price: 1500 },
      { name: 'Lunch 500 unidades (14x14 - 1 hoja)', price: 2350 },
      { name: 'Coctel 400 unidades (24x24 - 1 hoja Elite)', price: 4000 },
      { name: 'Paquete 100 unidades (40x40 - doble hoja Elite)', price: 6600 }
    ]},
    { id: 'pap-10', name: 'Servilletas Interfoliadas 20x20 cm (200 Unidades)', price: 1500, cat: 'Papel Higiénico / Toallas de Papel', img: '/images/servilleta-interfoleada-20x20cm-200UN.png' },

    // --- DISPENSADORES ---
    { id: 'dis-1', name: 'Dispensador de Toalla Interfoliada (Capacidad 400)', price: 9000, cat: 'Dispensadores', img: '/images/dispensador-toalla-interfoliada-400.png' },
    { id: 'dis-2', name: 'Dispensador de Servilletas (Capacidad 400)', price: 7000, cat: 'Dispensadores', img: '/images/dispensador-servilleta-400.png' },
    { id: 'dis-3', name: 'Dispensador de Papel Higiénico (300 a 500 metros)', price: 11000, cat: 'Dispensadores', img: '/images/dispensador-papelhigienico-300-500metros.png' },
    { id: 'dis-4', name: 'Dispensador de Papel Gigante (200 a 500 metros)', price: 29000, cat: 'Dispensadores', img: '/images/dispensador-papel-200a500metros.png' },
    { id: 'dis-5', name: 'Dispensador de Palanca para Rollo (200 a 300 metros)', price: 39990, cat: 'Dispensadores', img: '/images/dispensador-palanca-rollo200-300metros.png' },
    { id: 'dis-6', name: 'Dispensador de Jabón Líquido (350 ml)', price: 9000, cat: 'Dispensadores', img: '/images/dispensador-jabon-350ML.png' },
  ]

  const categories = ['Todos', 'Ofertas', 'Detergentes', 'Jabón y Lavalozas', 'Limpieza', 'Cloro y Desinfectantes', 'Bolsas y Accesorios', 'Papel Higiénico / Toallas de Papel', 'Dispensadores']

  const filteredProducts = selectedCategory === 'Todos' 
    ? productos 
    : productos.filter(p => p.cat === selectedCategory)

  return (
    <div
      id="inicio"
      className="scroll-mt-24 min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-x-hidden pt-24 pb-20"
    >

      {/* Navbar Principal Fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-neutral-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-3">
          <LogoButton />

          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-neutral-300">
            <a href="#catalogo" onClick={(e) => handleNavClick(e, 'catalogo')} className="hover:text-emerald-400 transition-colors cursor-pointer">Catálogo</a>
            <a href="#envios" onClick={(e) => handleNavClick(e, 'envios')} className="hover:text-emerald-400 transition-colors cursor-pointer">Envíos</a>
            <a href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')} className="hover:text-emerald-400 transition-colors cursor-pointer">Contacto</a>
            <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-emerald-400 transition-colors cursor-pointer">Preguntas Frecuentes</a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-[#0A4D94] hover:bg-[#083b73] text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="hidden sm:inline text-xs">Mi Carro</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </button>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-neutral-300 hover:text-white p-2 focus:outline-none" aria-label="Abrir menú">
                {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-2 pb-6 space-y-4 shadow-2xl transition-all">
            <a href="#catalogo" onClick={(e) => handleNavClick(e, 'catalogo')} className="block text-neutral-300 hover:text-emerald-400 font-semibold text-base py-2 border-b border-neutral-900">Catálogo</a>
            <a href="#envios" onClick={(e) => handleNavClick(e, 'envios')} className="block text-neutral-300 hover:text-emerald-400 font-semibold text-base py-2 border-b border-neutral-900">Envíos</a>
            <a href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')} className="block text-neutral-300 hover:text-emerald-400 font-semibold text-base py-2 border-b border-neutral-900">Contacto</a>
            <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="block text-neutral-300 hover:text-emerald-400 font-semibold text-base py-2">Preguntas Frecuentes</a>
          </div>
        )}
      </header>

      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900 py-10 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <div className="relative w-64 h-64 sm:w-96 sm:h-96 lg:w-[450px] lg:h-[450px] flex items-center justify-center group">
              <div className="relative w-full h-full drop-shadow-2xl scale-110 sm:scale-125">
                <Image src="/logo.png" alt="PacificoClean Logo Gigante" fill className="object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#0A4D94]">
              Soluciones de aseo para hogares, empresas e instituciones
            </h1>
            <p className="text-sm sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Catálogo especializado con referencias individuales por producto de limpieza y aseo profesional. Stock y precios sujetos a confirmación comercial.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 pt-2">
              <a href="#catalogo" onClick={(e) => handleNavClick(e, 'catalogo')} className="bg-[#0A4D94] hover:bg-[#083b73] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-center">Ver Catálogo</a>
              <a href="#envios" onClick={(e) => handleNavClick(e, 'envios')} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all border border-slate-300 shadow-xs text-center">Ver Despachos</a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Catálogo Completo */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 scroll-mt-24 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A4D94] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Catálogo Completo</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-2">Nuestros Productos y Ofertas</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Selecciona tu variante preferida, revisa la foto ampliada y agrégalo a tu carro.
          </p>
        </div>

        {/* Barra de categorías */}
        <div className="w-full overflow-x-auto pb-4 pt-2 mb-8 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="flex items-center gap-2.5 w-max min-w-full px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#0A4D94] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de productos con selector de variantes */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory">
          {filteredProducts.map((prod) => {
            const currentVariantIdx = selectedVariants[prod.id] || 0
            const displayPrice = prod.variants ? prod.variants[currentVariantIdx].price : prod.price

            return (
              <div 
                key={prod.id} 
                className="min-w-[270px] sm:min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group relative snap-start flex-shrink-0"
              >
                {prod.badge && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-20 shadow-sm">
                    {prod.badge}
                  </span>
                )}

                {/* Contenedor de la Imagen */}
                <div 
                  onClick={() => setActiveImageModal(prod.img)}
                  title="Haz clic para ampliar la imagen"
                  className="relative h-52 sm:h-56 w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden border-b border-slate-100 cursor-zoom-in"
                >
                  <span className="absolute top-2 left-2 bg-[#0A4D94] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider z-20 shadow-md flex items-center gap-1">
                    {prod.cat} <ExternalLink className="w-2.5 h-2.5" />
                  </span>

                  <div className="relative w-full h-full pt-4">
                    <Image 
                      src={prod.img} 
                      alt={prod.name} 
                      fill 
                      sizes="(max-width: 768px) 270px, 25vw"
                      className="object-contain group-hover:scale-125 transition-transform duration-500 ease-out" 
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                    <span className="bg-white/90 text-slate-900 text-xs font-bold py-1 px-3 rounded-full shadow-md">Ampliar imagen</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-[#0A4D94] transition-colors">
                      {prod.name}
                    </h3>

                    {/* Selector desplegable de variantes si las tiene */}
                    {prod.variants && prod.variants.length > 0 && (
                      <div className="mt-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Elige tu opción:
                        </label>
                        <div className="relative">
                          <select
                            value={currentVariantIdx}
                            onChange={(e) => setSelectedVariants({ ...selectedVariants, [prod.id]: Number(e.target.value) })}
                            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-[#0A4D94] transition-colors cursor-pointer"
                          >
                            {prod.variants.map((v, vIdx) => (
                              <option key={vIdx} value={vIdx}>
                                {v.name} — ${v.price.toLocaleString('es-CL')}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Precio Ref:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm sm:text-lg font-black text-[#0A4D94]">
                          ${displayPrice.toLocaleString('es-CL')}
                        </span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">${prod.originalPrice.toLocaleString('es-CL')}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(prod, prod.id)}
                      className="bg-[#0A4D94] hover:bg-[#083b73] text-white font-medium text-xs py-2 px-3 sm:px-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* MODAL VISOR DE IMAGEN */}
      {activeImageModal && (
        <div 
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] p-4 flex flex-col items-center shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 bg-slate-900 hover:bg-black text-white p-2.5 rounded-full shadow-lg transition-all z-20 cursor-pointer"
              aria-label="Cerrar imagen"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[70vh] flex items-center justify-center bg-slate-50 rounded-2xl p-2 mt-2">
              <Image 
                src={activeImageModal} 
                alt="Vista ampliada del producto" 
                fill 
                className="object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 font-medium text-center">
              Haz clic fuera de la imagen o en el botón superior para cerrar.
            </p>
          </div>
        </div>
      )}

      {/* CARRITO Y FORMULARIO DE ENVÍO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto transition-transform">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-[#0A4D94]" />
                  <h3 className="font-black text-lg text-slate-900">Tu Carrito de Pedido</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto" />
                  <p className="text-slate-500 text-sm font-medium">Tu carro está vacío. ¡Agrega productos desde el catálogo!</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-slate-100 my-4 max-h-[35vh] overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-3">
                        <div className="relative w-12 h-12 bg-slate-50 rounded-xl flex-shrink-0 border border-slate-100 p-1">
                          <Image src={item.img} alt={item.name} fill className="object-contain" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-2">{item.name}</h4>
                          <span className="text-xs text-[#0A4D94] font-black">${(item.price * item.qty).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                          <button 
                            onClick={() => updateQty(item.name, -1)}
                            className="w-6 h-6 bg-white rounded-lg shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.name, 1)}
                            className="w-6 h-6 bg-white rounded-lg shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.name)}
                          className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 mt-2">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0A4D94]" /> Datos para tu Entrega / Despacho
                    </h4>

                    {/* AVISO DE ERROR SI FALTAN CAMPOS */}
                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl animate-pulse">
                        {formError}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tu Nombre</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Juan Pérez" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0A4D94]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Teléfono de Contacto</label>
                      <input 
                        type="tel" 
                        placeholder="Ej. +56 9 1234 5678" 
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0A4D94]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Dirección de Entrega</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Av. Argentina 123" 
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0A4D94]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-[#0A4D94]" /> Ciudad / Comuna de Despacho
                      </label>
                      <select 
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0A4D94] font-bold"
                      >
                        <option value="Valparaíso">Valparaíso (Despacho GRATIS)</option>
                        <option value="Viña del Mar">Viña del Mar (+$2.000)</option>
                        <option value="Concón">Concón (+$3.000)</option>
                        <option value="Quilpué">Quilpué (+$3.000)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3 mt-4">
              {cart.length > 0 && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal productos:</span>
                    <span>${subtotalCartPrice.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Costo Despacho ({clientCity}):</span>
                    <span className="font-bold text-emerald-600">{shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toLocaleString('es-CL')}`}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-100">
                    <span>Total Final:</span>
                    <span className="text-[#0A4D94]">${finalTotal.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                  <button
                onClick={checkoutWhatsApp}
                className="w-full bg-[#0A4D94] hover:bg-[#083b73] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {/* Icono oficial de WhatsApp */}
                <svg className="w-5 h-5 fill-current text-emerald-400" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Enviar Pedido por WhatsApp</span>
              </button>
              )}

              {/* Botón Seguir Comprando */}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-slate-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Seguir Comprando</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tarifas de Envío */}
      <section id="envios" className="bg-white py-12 sm:py-16 border-t border-b border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-bold text-[#0A4D94] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">Logística y Envíos</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Valores de Despacho en la Región</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="bg-emerald-50/50 border border-emerald-200 p-4 sm:p-6 rounded-2xl text-center space-y-1 sm:space-y-2">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-lg">Valparaíso</h3>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">GRATIS</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-2xl text-center space-y-1 sm:space-y-2">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-[#0A4D94] mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-lg">Viña del Mar</h3>
              <p className="text-xl sm:text-2xl font-black text-[#0A4D94]">$2.000</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-2xl text-center space-y-1 sm:space-y-2">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-[#0A4D94] mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-lg">Concón</h3>
              <p className="text-xl sm:text-2xl font-black text-[#0A4D94]">$3.000</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-2xl text-center space-y-1 sm:space-y-2">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-[#0A4D94] mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-lg">Quilpué</h3>
              <p className="text-xl sm:text-2xl font-black text-[#0A4D94]">$3.000</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Preguntas Frecuentes (FAQ) */}
      <section id="faq" className="bg-white py-16 sm:py-20 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <HelpCircle className="w-10 h-10 text-[#0A4D94] mx-auto" />
            <h2 className="text-3xl font-black text-slate-900">Preguntas Frecuentes</h2>
            <p className="text-slate-500 text-sm">Resolvemos tus dudas sobre compras, despachos y pagos.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-2">¿Cómo se confirman el stock y los precios?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Al rellenar tus datos y enviar el pedido, se abrirá un chat directo a nuestro WhatsApp corporativo con el resumen completo indicando la variante exacta que elegiste. En ese momento nuestro equipo validará el stock físico y confirmará el total exacto.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-2">¿Cuáles son los plazos y costos de envío?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Los despachos dentro de **Valparaíso son completamente gratis**. Para Viña del Mar el costo es de $2.000, y para Concón y Quilpué es de $3.000. Los tiempos de entrega se coordinan de forma ágil al momento de tu compra.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-2">¿Realizan ventas al por mayor para empresas e instituciones?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sí, abastecemos a oficinas, edificios, colegios, locales comerciales y empresas con tarifas especiales y cotizaciones formales a medida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sección Contacto Oficial */}
      <section id="contacto" className="bg-slate-900 text-white py-16 sm:py-20 px-4 scroll-mt-24">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="bg-blue-500/15 text-blue-300 border border-blue-500/30 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
            Atención Directa en Valparaíso
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">¿Listo para hacer tu pedido o cotizar al por mayor?</h2>
          <p className="text-slate-300 max-w-xl mx-auto text-xs sm:text-base">
            Escríbenos por WhatsApp o contáctanos a través de nuestras vías oficiales.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
            <a href="tel:+56959406597" className="bg-slate-800 hover:bg-slate-700 p-5 rounded-2xl border border-slate-700 transition-all flex flex-col items-center gap-2">
              <Phone className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-slate-400">Teléfono / WhatsApp</span>
              <span className="font-bold text-xs sm:text-sm">+56 9 59406597</span>
            </a>
            <a href="mailto:pacificocleanvalparaiso@gmail.com" className="bg-slate-800 hover:bg-slate-700 p-5 rounded-2xl border border-slate-700 transition-all flex flex-col items-center gap-2">
              <Mail className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-slate-400">Correo Electrónico</span>
              <span className="font-bold text-xs truncate max-w-full">pacificocleanvalparaiso@gmail.com</span>
            </a>
            <a href="https://instagram.com/pacificoclean" target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 p-5 rounded-2xl border border-slate-700 transition-all flex flex-col items-center gap-2">
              <Instagram className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-slate-400">Instagram</span>
              <span className="font-bold text-xs sm:text-sm">@pacificoclean</span>
            </a>
          </div>

<div className="pt-4">
            <a 
              href="https://wa.me/56959406597?text=Hola,%20necesito%20hacer%20un%20pedido%20de%20aseo." 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#0A4D94] hover:bg-[#083b73] text-white font-bold py-3.5 px-6 sm:px-8 rounded-2xl transition-all shadow-xl text-base sm:text-lg"
            >
              {/* Icono oficial de WhatsApp */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-emerald-400" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer Legal con Créditos CiberByte en azul */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-transparent">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-bold text-white text-base">Pacífico<span className="text-emerald-500">Clean</span></span>
            </div>
            <p className="text-xs text-slate-500">Soluciones integrales de aseo profesional, institucional y domiciliario en Valparaíso y alrededores.</p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#catalogo" onClick={(e) => handleNavClick(e, 'catalogo')} className="hover:text-white transition-colors cursor-pointer">Catálogo Completo</a></li>
              <li><a href="#envios" onClick={(e) => handleNavClick(e, 'envios')} className="hover:text-white transition-colors cursor-pointer">Tarifas de Despacho</a></li>
              <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-white transition-colors cursor-pointer">Preguntas Frecuentes</a></li>
              <li><a href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')} className="hover:text-white transition-colors cursor-pointer">Contacto Comercial</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">Términos y Legal</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-emerald-500" /> <span>Stock y precios sujetos a confirmación</span></li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> <span>Garantía de calidad institucional</span></li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> <span>Transacciones seguras vía WhatsApp</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">Contacto Oficial</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Valparaíso, Chile</li>
              <li>Tel / WhatsApp: +56 9 59406597</li>
              <li>Email: pacificocleanvalparaiso@gmail.com</li>
              <li>IG: @pacificoclean</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <span>© 2026 PacíficoClean Aseo Profesional. Todos los derechos reservados.</span>
          <span>
            Desarrollado por <a href="https://ciberbyte.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">CiberByte</a>
          </span>
        </div>
      </footer>

          {/* COMPONENTE DE VERCEL ANALYTICS */}
      <Analytics />
    </div>
    )
        
  
}