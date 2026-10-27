import type { Metadata } from 'next'
import { BUSINESS } from '@/lib/business'

export const metadata: Metadata = {
  title: 'Política de privacidad | PacíficoClean',
  description: 'Cómo PacíficoClean trata los datos personales de sus clientes.',
}

export default function PrivacidadPage() {
  return (
    <>
      <div className="space-y-1">
        <h1>Política de privacidad</h1>
        <p className="text-slate-500 text-sm">Última actualización: {BUSINESS.lastLegalUpdate}</p>
      </div>

      <p>
        En {BUSINESS.brand} cuidamos tus datos personales. Esta política explica qué información pedimos, para qué la
        usamos y cuáles son tus derechos, conforme a la Ley N° 19.628 sobre protección de datos personales y sus
        modificaciones.
      </p>

      <h2>1. Responsable</h2>
      <p>
        {BUSINESS.legalName}, RUT {BUSINESS.rut}, con domicilio en {BUSINESS.address}. Contacto:{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>

      <h2>2. Qué datos pedimos y cómo funciona el pedido</h2>
      <p>
        Para coordinar tu pedido te pedimos tu <strong>nombre, teléfono, dirección y comuna de despacho</strong>. Estos
        datos <strong>no se envían ni se guardan en nuestros servidores</strong>: se usan para armar un mensaje de
        WhatsApp que tú decides enviarnos. A partir de ese momento, la conversación queda en WhatsApp, servicio que
        tiene sus propias condiciones y política de privacidad.
      </p>

      <h2>3. Para qué los usamos</h2>
      <ul>
        <li>Confirmar el stock y el total de tu pedido.</li>
        <li>Coordinar el pago y la entrega en la dirección que indiques.</li>
        <li>Responder tus consultas, cambios o reclamos.</li>
      </ul>
      <p>No vendemos ni cedemos tus datos a terceros. Solo los usamos para gestionar tu pedido.</p>

      <h2>4. Información guardada en tu navegador</h2>
      <p>
        Para que no pierdas tu pedido si recargas la página, el carrito y los datos de entrega se guardan{' '}
        <strong>solo en tu propio navegador</strong> (almacenamiento local). Esa información no sale de tu dispositivo
        y puedes borrarla vaciando el carrito o eliminando los datos de navegación de este sitio.
      </p>

      <h2>5. Estadísticas y cookies</h2>
      <p>
        Usamos estadísticas de visitas anónimas y agregadas (por ejemplo, cuántas personas visitan el sitio) que no
        utilizan cookies ni te identifican personalmente. El sitio no usa cookies publicitarias ni de seguimiento.
        Solo el panel de administración interno usa cookies técnicas, necesarias para iniciar sesión.
      </p>

      <h2>6. Proveedores tecnológicos</h2>
      <p>
        El sitio está alojado en Vercel y el catálogo de productos se administra con Supabase. Estos proveedores pueden
        registrar datos técnicos de conexión (como la dirección IP y el tipo de navegador) para operar y proteger el
        servicio.
      </p>

      <h2>7. Cuánto tiempo los conservamos</h2>
      <p>
        Conservamos la información de tus pedidos solo durante el tiempo necesario para gestionarlos y para cumplir
        nuestras obligaciones legales y tributarias.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Puedes solicitar el acceso, la rectificación, la eliminación de tus datos o oponerte a su tratamiento,
        escribiendo a <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. Responderemos dentro de los plazos
        que establece la ley.
      </p>

      <h2>9. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política. La versión vigente siempre estará publicada en esta página, con su fecha de
        última actualización.
      </p>
    </>
  )
}
