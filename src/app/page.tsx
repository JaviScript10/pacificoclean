import { getCatalog } from '@/lib/catalog'
import { CatalogView } from '@/components/catalog-view'

// Respaldo: la página se regenera como máximo cada hora.
// Cuando el panel admin guarde cambios, la regeneraremos al instante.
export const revalidate = 3600

export default async function Home() {
  const catalog = await getCatalog()
  return <CatalogView {...catalog} />
}