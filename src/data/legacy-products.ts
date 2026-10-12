// Copia temporal del catálogo actual. Solo se usa para migrar a Supabase.
export type LegacyProduct = {
  id: string
  name: string
  price: number
  cat: string
  img: string
  badge?: string
  originalPrice?: number
  variants?: { name: string; price: number }[]
}

export const productos: LegacyProduct[] = [
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

  // --- LIMPIEZA DE SUPERFICIES Y PISOS ---
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