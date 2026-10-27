'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Analytics } from '@vercel/analytics/react'
import {
  Phone,
  Mail,
  Instagram,
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
  ArrowLeft,
  Search,
  Check
} from 'lucide-react'
import type { Catalog, CatalogProduct } from '@/lib/catalog'

const FALLBACK_IMG = '/logo.png'
const STORAGE_KEY = 'pacificoclean:pedido:v1'

type CartItem = { name: string; price: number; qty: number; img: string }

// '56959406597' -> '+56 9 59406597'
function formatPhone(n: string) {
  return `+${n.slice(0, 2)} ${n.slice(2, 3)} ${n.slice(3)}`
}

// Búsqueda sin importar tildes ni mayúsculas: "jabon" encuentra "Jabón"
function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// ['A'] -> 'A' · ['A','B'] -> 'A y B' · ['A','B','C'] -> 'A, B y C'
function joinEs(items: string[]) {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

function clp(n: number) {
  return `$${n.toLocaleString('es-CL')}`
}

// Nombre con que cada producto/opción queda en el carrito
function cartName(product: CatalogProduct, variantIndex: number) {
  const v = product.variants[variantIndex] ?? product.variants[0]
  return product.variants.length > 1 && v.name ? `${product.name} (${v.name})` : product.name
}

// Logo del header con scroll suave al inicio
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
          alt="PacíficoClean Logo" 
          fill 
          sizes="88px"
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

export function CatalogView({ products: allProducts, categories: dbCategories, settings }: Catalog) {
  // Productos sin precio no se muestran
  const productos = useMemo(() => allProducts.filter(p => p.variants.length > 0), [allProducts])

  // Comunas ordenadas por costo (gratis primero)
  const shippingOptions = useMemo(
    () => Object.entries(settings.shipping).sort((a, b) => a[1] - b[1]),
    [settings.shipping]
  )
  const whatsapp = settings.whatsapp

  // Precio e imagen vigentes de cada ítem posible del carrito (para actualizar carritos guardados)
  const currentItems = useMemo(() => {
    const map = new Map<string, { price: number; img: string }>()
    for (const p of productos) {
      p.variants.forEach((v, i) => {
        map.set(cartName(p, i), { price: v.price, img: p.imageUrl ?? FALLBACK_IMG })
      })
    }
    return map
  }, [productos])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [query, setQuery] = useState('')
  
  // Ventana de imagen ampliada
  const [activeImageModal, setActiveImageModal] = useState<{ product: CatalogProduct; price: number; img: string; cat: string } | null>(null)

  // Carrito
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: number }>({})

  // Botón "Agregado" por producto y animación de la barra del carrito
  const [addedIds, setAddedIds] = useState<string[]>([])
  const [bump, setBump] = useState(false)
  const [modalAdded, setModalAdded] = useState(false)
  const addedTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const bumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Datos del cliente para el despacho
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientCity, setClientCity] = useState(shippingOptions[0]?.[0] ?? 'Valparaíso')
  const [formError, setFormError] = useState('')

  // ---------- Pedido guardado en el navegador ----------

  const [loaded, setLoaded] = useState(false)

  // Al abrir la página: recupera el pedido guardado con precios actualizados
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (Array.isArray(saved.cart)) {
          const restored: CartItem[] = saved.cart
            .filter((i: any) => i && typeof i.name === 'string' && Number.isInteger(i.qty) && i.qty > 0)
            .map((i: any) => {
              const current = currentItems.get(i.name)
              return current ? { name: i.name, qty: i.qty, price: current.price, img: current.img } : null
            })
            .filter(Boolean) // se descartan productos que ya no existen u ocultos
          setCart(restored)
        }
        if (typeof saved.name === 'string') setClientName(saved.name)
        if (typeof saved.phone === 'string') setClientPhone(saved.phone)
        if (typeof saved.address === 'string') setClientAddress(saved.address)
        if (typeof saved.city === 'string' && settings.shipping[saved.city] !== undefined) setClientCity(saved.city)
      }
    } catch {
      // Si el navegador bloquea el almacenamiento, el carrito funciona igual sin guardarse
    }
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cada cambio se guarda (solo en este navegador)
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cart, name: clientName, phone: clientPhone, address: clientAddress, city: clientCity })
      )
    } catch {}
  }, [loaded, cart, clientName, clientPhone, clientAddress, clientCity])

  // ---------- Ventanas: cerrar con Escape y congelar el fondo ----------

  const anyOverlayOpen = Boolean(activeImageModal) || isCartOpen

  useEffect(() => {
    if (!anyOverlayOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [anyOverlayOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (activeImageModal) setActiveImageModal(null)
      else if (isCartOpen) setIsCartOpen(false)
      else if (mobileMenuOpen) setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeImageModal, isCartOpen, mobileMenuOpen])

  useEffect(() => {
    const timers = addedTimers.current
    return () => {
      timers.forEach(clearTimeout)
      if (bumpTimer.current) clearTimeout(bumpTimer.current)
    }
  }, [])

  // ---------- Navegación ----------

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

  // ---------- Carrito ----------

  const addToCart = (product: CatalogProduct) => {
    const variantIndex = selectedVariants[product.id] || 0
    const chosenVariant = product.variants[variantIndex] ?? product.variants[0]
    const finalName = cartName(product, variantIndex)
    const img = product.imageUrl ?? FALLBACK_IMG

    setCart(prevCart => {
      const existing = prevCart.find(item => item.name === finalName)
      if (existing) {
        return prevCart.map(item => 
          item.name === finalName ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prevCart, { name: finalName, price: chosenVariant.price, qty: 1, img }]
    })

    // El mismo botón cambia a "Agregado" por un momento
    setAddedIds(prev => (prev.includes(product.id) ? prev : [...prev, product.id]))
    const previousTimer = addedTimers.current.get(product.id)
    if (previousTimer) clearTimeout(previousTimer)
    addedTimers.current.set(
      product.id,
      setTimeout(() => {
        setAddedIds(prev => prev.filter(id => id !== product.id))
        addedTimers.current.delete(product.id)
      }, 1500)
    )

    setBump(true)
    if (bumpTimer.current) clearTimeout(bumpTimer.current)
    bumpTimer.current = setTimeout(() => setBump(false), 700)
  }

  const updateQty = (name: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.name === name) {
          const newQty = item.qty + delta
          return newQty > 0 ? { ...item, qty: newQty } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (name: string) => {
    setCart(prevCart => prevCart.filter(item => item.name !== name))
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

  const shippingCost = settings.shipping[clientCity] ?? 0
  const finalTotal = subtotalCartPrice + (cart.length > 0 ? shippingCost : 0)
  const shippingLabel = shippingCost === 0 ? 'GRATIS' : clp(shippingCost)

  const checkoutWhatsApp = () => {
    if (cart.length === 0) return

    if (!clientName.trim() || !clientPhone.trim() || !clientAddress.trim()) {
      setFormError('⚠️ Por favor, completa tu nombre, teléfono y dirección antes de enviar el pedido.')
      return
    }

    // Acepta formatos como 912345678, +56 9 1234 5678 o 32 212 3456
    const digits = clientPhone.replace(/\D/g, '')
    if (digits.length < 8 || digits.length > 11) {
      setFormError('⚠️ Revisa tu teléfono: debe tener entre 8 y 11 dígitos (ej: +56 9 1234 5678).')
      return
    }

    setFormError('')

    let message = `NUEVO PEDIDO / COTIZACIÓN - PacíficoClean\n\n`
    message += `Cliente: ${clientName.trim()}\n`
    message += `Teléfono: ${clientPhone.trim()}\n`
    message += `Dirección: ${clientAddress.trim()}\n`
    message += `Ciudad / Comuna: ${clientCity} (Despacho: ${shippingLabel})\n\n`
    message += `Detalle de productos:\n`
    cart.forEach(item => {
      message += `- ${item.qty}x ${item.name} (${clp(item.price * item.qty)})\n`
    })
    message += `\nSubtotal: ${clp(subtotalCartPrice)}`
    message += `\nCosto de despacho: ${shippingLabel}`
    message += `\nTOTAL FINAL: ${clp(finalTotal)}\n\n¿Hay stock disponible para coordinar la entrega?`
    
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      window.location.href = url
    } else {
      window.open(url, '_blank')
    }
  }

  // ---------- Filtros ----------

  const categories = ['Todos', 'Ofertas', ...dbCategories]

  const searchTerm = normalize(query.trim())
  const filteredProducts = productos.filter(p => {
    const inCategory =
      selectedCategory === 'Todos' ||
      (selectedCategory === 'Ofertas' ? p.isOffer : p.category === selectedCategory)
    return inCategory && (!searchTerm || normalize(p.name).includes(searchTerm))
  })

  // ---------- Texto de envíos para la FAQ (sale de la misma configuración) ----------

  const freeCities = shippingOptions.filter(([, cost]) => cost === 0).map(([city]) => city)
  const paidByCost = new Map<number, string[]>()
  for (const [city, cost] of shippingOptions) {
    if (cost > 0) paidByCost.set(cost, [...(paidByCost.get(cost) ?? []), city])
  }
  const paidPhrases = Array.from(paidByCost.entries()).map(
    ([cost, cities]) => `para ${joinEs(cities)} es de ${clp(cost)}`
  )

  const year = new Date().getFullYear()

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
              aria-label={`Abrir carrito (${totalCartItems} productos)`}
              className="relative bg-[#0A4D94] hover:bg-[#083b73] text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="hidden sm:inline text-xs">Mi Carro</span>
              {totalCartItems > 0 && (
                <span className={`absolute -top-2 -right-2 bg-amber-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform ${bump ? 'scale-125' : 'scale-100'}`}>
                  {totalCartItems}
                </span>
              )}
            </button>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-neutral-300 hover:text-white p-2 focus:outline-none" aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}>
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
                <Image
                  src="/logo.png"
                  alt="PacíficoClean Logo Gigante"
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 480px, 560px"
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#0A4D94]">
              Artículos de aseo y limpieza en Valparaíso
            </h1>
            <p className="text-sm sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Productos de aseo para hogares, empresas e instituciones, con despacho en {joinEs(shippingOptions.map(([city]) => city))}, incluidos Playa Ancha y los cerros de Valparaíso. Stock y precios sujetos a confirmación.
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A4D94] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Catálogo Completo</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-2">Nuestros Productos y Ofertas</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Haz clic en la imagen de cualquier producto para ver su detalle ampliado con mayor claridad.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (selectedCategory !== 'Todos') setSelectedCategory('Todos')
            }}
            placeholder="Buscar producto: cloro, papel, bolsas…"
            aria-label="Buscar producto"
            className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-900 shadow-xs focus:outline-none focus:border-[#0A4D94]"
          />
        </div>

        {/* Barra de categorías */}
        <div className="w-full overflow-x-auto pb-4 pt-2 mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5 w-max min-w-full px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setQuery('') }}
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

        {/* Sin resultados */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <p className="text-slate-500 text-sm sm:text-base">
              No encontramos productos{searchTerm ? <> para <strong>“{query.trim()}”</strong></> : ''}{selectedCategory !== 'Todos' ? <> en <strong>{selectedCategory}</strong></> : ''}.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {selectedCategory !== 'Todos' && (
                <button onClick={() => setSelectedCategory('Todos')} className="bg-[#0A4D94] hover:bg-[#083b73] text-white font-bold text-sm py-2.5 px-5 rounded-xl cursor-pointer">
                  Buscar en todas las categorías
                </button>
              )}
              {searchTerm && (
                <button onClick={() => setQuery('')} className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm py-2.5 px-5 rounded-xl border border-slate-300 cursor-pointer">
                  Limpiar búsqueda
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grilla de productos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
          {filteredProducts.map((prod) => {
            const currentVariantIdx = selectedVariants[prod.id] || 0
            const displayPrice = (prod.variants[currentVariantIdx] ?? prod.variants[0]).price
            const img = prod.imageUrl ?? FALLBACK_IMG
            const catLabel = prod.isOffer ? 'Ofertas' : (prod.category ?? '')

            return (
              <div 
                key={prod.id} 
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group relative"
              >
                {prod.badge && (
                  <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full uppercase tracking-wider z-20 shadow-sm">
                    {prod.badge}
                  </span>
                )}

                {/* Imagen: abre la ventana ampliada */}
                <button
                  type="button"
                  onClick={() => setActiveImageModal({ product: prod, price: displayPrice, img, cat: catLabel })}
                  aria-label={`Ver imagen ampliada de ${prod.name}`}
                  className="relative h-36 sm:h-56 w-full bg-slate-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden border-b border-slate-100 cursor-zoom-in"
                >
                  <span className="absolute top-2 left-2 bg-[#0A4D94] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider z-20 shadow-md hidden sm:flex items-center gap-1">
                    {catLabel} <ExternalLink className="w-2.5 h-2.5" />
                  </span>

                  <span className="relative block w-full h-full pt-4">
                    <Image 
                      src={img} 
                      alt={prod.name} 
                      fill 
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-contain group-hover:scale-110 transition-transform duration-500 ease-out" 
                    />
                  </span>
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                    <span className="bg-white/95 text-slate-900 text-xs font-bold py-1.5 px-3.5 rounded-full shadow-md">Ver grande</span>
                  </span>
                </button>

                <div className="p-3 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-[#0A4D94] transition-colors">
                      {prod.name}
                    </h3>

                    {/* Selector de variantes */}
                    {prod.variants.length > 1 && (
                      <div className="mt-3">
                        <label htmlFor={`variant-${prod.id}`} className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Elige tu opción:
                        </label>
                        <div className="relative">
                          <select
                            id={`variant-${prod.id}`}
                            value={currentVariantIdx}
                            onChange={(e) => setSelectedVariants({ ...selectedVariants, [prod.id]: Number(e.target.value) })}
                            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-3 py-1.5 pr-7 text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-[#0A4D94] transition-colors cursor-pointer"
                          >
                            {prod.variants.map((v, vIdx) => (
                              <option key={v.id} value={vIdx}>
                                {v.name} — {clp(v.price)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Precio Ref:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm sm:text-lg font-black text-[#0A4D94]">
                          {clp(displayPrice)}
                        </span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">{clp(prod.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(prod)}
                      aria-live="polite"
                      className={`${addedIds.includes(prod.id) ? 'bg-emerald-500 hover:bg-emerald-500 scale-105' : 'bg-[#0A4D94] hover:bg-[#083b73] scale-100'} active:scale-95 text-white font-medium text-xs py-2 px-3 sm:px-3.5 sm:min-w-[104px] rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer`}
                    >
                      {addedIds.includes(prod.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Agregado</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Agregar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* VENTANA DE IMAGEN AMPLIADA */}
      {activeImageModal && (
        <div 
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            role="dialog"
            aria-modal="true"
            aria-label={activeImageModal.product.name}
            className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col space-y-4"
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all z-20 cursor-pointer shadow-sm"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-10">
              <span className="text-[11px] font-bold text-[#0A4D94] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {activeImageModal.cat}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {activeImageModal.product.name}
              </h3>
            </div>

            <div className="relative w-full h-64 sm:h-72 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100">
              <Image 
                src={activeImageModal.img} 
                alt={activeImageModal.product.name} 
                fill 
                sizes="(max-width: 640px) 90vw, 480px"
                className="object-contain"
              />
            </div>

            {activeImageModal.product.description && (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {activeImageModal.product.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Precio por unidad:</span>
                <span className="text-2xl font-black text-[#0A4D94]">
                  {clp(activeImageModal.price)}
                </span>
              </div>
              <button
                onClick={() => {
                  if (modalAdded) return
                  addToCart(activeImageModal.product)
                  setModalAdded(true)
                  setTimeout(() => {
                    setModalAdded(false)
                    setActiveImageModal(null)
                  }, 700)
                }}
                aria-live="polite"
                className={`${modalAdded ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-[#0A4D94] hover:bg-[#083b73]'} text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center gap-2`}
              >
                {modalAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                {modalAdded ? 'Agregado' : 'Agregar al Carro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARRITO Y FORMULARIO DE ENVÍO */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Tu carrito de pedido"
            className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto overscroll-contain"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-[#0A4D94]" />
                  <h3 className="font-black text-lg text-slate-900">Tu Carrito de Pedido</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Cerrar carrito"
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
                    {cart.map((item) => (
                      <div key={item.name} className="py-3 flex items-center justify-between gap-3">
                        <div className="relative w-12 h-12 bg-slate-50 rounded-xl flex-shrink-0 border border-slate-100 p-1">
                          <Image src={item.img} alt={item.name} fill sizes="48px" className="object-contain" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-2">{item.name}</h4>
                          <span className="text-xs text-[#0A4D94] font-black">{clp(item.price * item.qty)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                          <button 
                            onClick={() => updateQty(item.name, -1)}
                            aria-label={`Quitar uno de ${item.name}`}
                            className="w-6 h-6 bg-white rounded-lg shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.name, 1)}
                            aria-label={`Agregar uno de ${item.name}`}
                            className="w-6 h-6 bg-white rounded-lg shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.name)}
                          className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          aria-label={`Eliminar ${item.name}`}
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

                    {formError && (
                      <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl">
                        {formError}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="client-name" className="block text-[11px] font-bold text-slate-600 mb-1">Tu Nombre</label>
                      <input 
                        id="client-name"
                        type="text" 
                        autoComplete="name"
                        placeholder="Ej. Juan Pérez" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0A4D94]"
                      />
                    </div>

                    <div>
                      <label htmlFor="client-phone" className="block text-[11px] font-bold text-slate-600 mb-1">Teléfono de Contacto</label>
                      <input 
                        id="client-phone"
                        type="tel" 
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="Ej. +56 9 1234 5678" 
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0A4D94]"
                      />
                    </div>

                    <div>
                      <label htmlFor="client-address" className="block text-[11px] font-bold text-slate-600 mb-1">Dirección de Entrega</label>
                      <input 
                        id="client-address"
                        type="text" 
                        autoComplete="street-address"
                        placeholder="Ej. Av. Argentina 123" 
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0A4D94]"
                      />
                    </div>

                    <div>
                      <label htmlFor="client-city" className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-[#0A4D94]" /> Ciudad / Comuna de Despacho
                      </label>
                      <select 
                        id="client-city"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0A4D94] font-bold"
                      >
                        {shippingOptions.map(([city, cost]) => (
                          <option key={city} value={city}>
                            {city} ({cost === 0 ? 'Despacho GRATIS' : `+${clp(cost)}`})
                          </option>
                        ))}
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
                    <span>{clp(subtotalCartPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Costo Despacho ({clientCity}):</span>
                    <span className="font-bold text-emerald-600">{shippingLabel}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-100">
                    <span>Total Final:</span>
                    <span className="text-[#0A4D94]">{clp(finalTotal)}</span>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <button
                  onClick={checkoutWhatsApp}
                  className="w-full bg-[#0A4D94] hover:bg-[#083b73] text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current text-emerald-400" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Enviar Pedido por WhatsApp</span>
                </button>
              )}

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

      {/* BARRA FIJA DE CARRITO (solo celular) */}
      {totalCartItems > 0 && !isCartOpen && !activeImageModal && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white/95 to-white/0">
          <button
            onClick={() => setIsCartOpen(true)}
            className={`w-full bg-[#0A4D94] active:bg-[#083b73] text-white rounded-2xl shadow-xl py-3 px-4 flex items-center justify-between gap-3 cursor-pointer transition-transform duration-200 ${bump ? 'scale-[1.03]' : 'scale-100'}`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              {totalCartItems} {totalCartItems === 1 ? 'producto' : 'productos'} · {clp(subtotalCartPrice)}
            </span>
            <span className="bg-white text-[#0A4D94] text-xs font-black py-2 px-3 rounded-xl">
              Ver pedido
            </span>
          </button>
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
            {shippingOptions.map(([city, cost]) => (
              cost === 0 ? (
                <div key={city} className="bg-emerald-50/50 border border-emerald-200 p-4 sm:p-6 rounded-2xl text-center space-y-1 sm:space-y-2">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-lg">{city}</h3>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600">GRATIS</p>
                </div>
              ) : (
                <div key={city} className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-2xl text-center space-y-1 sm:space-y-2">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-[#0A4D94] mx-auto" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-lg">{city}</h3>
                  <p className="text-xl sm:text-2xl font-black text-[#0A4D94]">{clp(cost)}</p>
                </div>
              )
            ))}
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
                {freeCities.length > 0 && (
                  <>Los despachos a <strong>{joinEs(freeCities)} son completamente gratis</strong>. </>
                )}
                {paidPhrases.length > 0 && (
                  <>El costo de envío {joinEs(paidPhrases)}. </>
                )}
                Los tiempos de entrega se coordinan de forma ágil al momento de tu compra.
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
            <a href={`tel:+${whatsapp}`} className="bg-slate-800 hover:bg-slate-700 p-5 rounded-2xl border border-slate-700 transition-all flex flex-col items-center gap-2">
              <Phone className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-slate-400">Teléfono / WhatsApp</span>
              <span className="font-bold text-xs sm:text-sm">{formatPhone(whatsapp)}</span>
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
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, necesito hacer un pedido de aseo.')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#0A4D94] hover:bg-[#083b73] text-white font-bold py-3.5 px-6 sm:px-8 rounded-2xl transition-all shadow-xl text-base sm:text-lg"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-emerald-400" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-transparent">
                <Image src="/logo.png" alt="" fill sizes="40px" className="object-contain" />
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
            <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">Redes y Contacto</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <svg className="w-4 h-4 fill-current text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>{formatPhone(whatsapp)} (WhatsApp / Fono)</span>
                </a>
              </li>
              <li>
                <a href="https://instagram.com/pacificoclean" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-400 transition-colors">
                  <Instagram className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <span>Instagram: @pacificoclean</span>
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@pacifico.clean" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                  <svg className="w-4 h-4 fill-current text-cyan-400 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.26 6.26 0 0 0 9.3 22a6.3 6.3 0 0 0 6.3-6.28V9.16a8.16 8.16 0 0 0 4.3 1.25V6.9a4.85 4.85 0 0 1-.31-.21z"/>
                  </svg>
                  <span>TikTok: @pacifico.clean</span>
                </a>
              </li>
              <li className="text-slate-500 pt-1">Valparaíso, Chile</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <span>© {year} PacíficoClean Aseo Profesional. Todos los derechos reservados.</span>
          <span>
            Desarrollado por <a href="https://ciberbyte.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">CiberByte</a>
          </span>
        </div>
      </footer>

      <Analytics />
    </div>
  )
}