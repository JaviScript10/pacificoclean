import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS } from '@/lib/business'

export const metadata: Metadata = {
  title: 'Aviso legal | PacíficoClean',
  description: 'Identificación del responsable y condiciones de uso del sitio PacíficoClean.',
}

export default function AvisoLegalPage() {
  return (
    <>
      <div className="space-y-1">
        <h1>Aviso legal</h1>
        <p className="text-slate-500 text-sm">Última actualización: {BUSINESS.lastLegalUpdate}</p>
      </div>

      <h2>1. Identificación del responsable</h2>
      <ul>
        <li><strong>Razón social:</strong> {BUSINESS.legalName}</li>
        <li><strong>RUT:</strong> {BUSINESS.rut}</li>
        <li><strong>Giro:</strong> {BUSINESS.activity}</li>
        <li><strong>Nombre comercial:</strong> {BUSINESS.brand}</li>
        <li><strong>Domicilio:</strong> {BUSINESS.address}</li>
        <li><strong>Correo electrónico:</strong> <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></li>
        <li><strong>Teléfono / WhatsApp:</strong> {BUSINESS.phone}</li>
        <li><strong>Sitio web:</strong> {BUSINESS.website}</li>
      </ul>

      <h2>2. Objeto del sitio</h2>
      <p>
        Este sitio presenta el catálogo de productos de aseo y limpieza de {BUSINESS.brand} y permite a los clientes
        armar un pedido o solicitud de cotización, que se envía y coordina a través de WhatsApp.
      </p>

      <h2>3. Precios y disponibilidad</h2>
      <p>
        Los precios se expresan en pesos chilenos e incluyen IVA. El stock y el total final del pedido se confirman por
        WhatsApp antes de la entrega. Si un producto no estuviera disponible, se informará al cliente antes de concretar
        la compra.
      </p>

      <h2>4. Pedidos, pago y despacho</h2>
      <p>
        El pedido se entiende confirmado una vez que {BUSINESS.brand} valida por WhatsApp el stock, el total y las
        condiciones de entrega. Los medios de pago y el horario de despacho se coordinan en esa misma conversación. Las
        comunas de despacho y sus costos vigentes se informan en el sitio.
      </p>

      <h2>5. Derechos del consumidor</h2>
      <p>
        Las compras realizadas a través de este sitio se rigen por la Ley N° 19.496 sobre Protección de los Derechos de
        los Consumidores. Para cambios, devoluciones, garantías o cualquier reclamo, escríbenos a{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> o por WhatsApp al {BUSINESS.phone}.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        El nombre, logotipo y contenidos propios de {BUSINESS.brand} pertenecen a {BUSINESS.legalName}. Las marcas y
        nombres de los productos comercializados pertenecen a sus respectivos fabricantes.
      </p>

      <h2>7. Datos personales</h2>
      <p>
        El tratamiento de los datos personales que entregas al hacer un pedido se describe en nuestra{' '}
        <Link href="/privacidad">Política de privacidad</Link>.
      </p>

      <h2>8. Legislación aplicable</h2>
      <p>Este sitio y sus condiciones se rigen por las leyes de la República de Chile.</p>
    </>
  )
}
