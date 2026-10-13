import { requireAdmin } from '@/lib/auth'
import { SettingsForm } from './settings-form'

export default async function ConfiguracionPage() {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('settings').select('key, value')

  let whatsapp = '56959406597'
  let shipping: Record<string, number> = {}
  for (const row of data ?? []) {
    if (row.key === 'whatsapp' && typeof row.value === 'string') whatsapp = row.value
    if (row.key === 'shipping' && row.value && typeof row.value === 'object') shipping = row.value
  }

  const rows = Object.entries(shipping)
    .sort((a, b) => a[1] - b[1])
    .map(([city, cost]) => ({ city, cost }))

  return <SettingsForm initialWhatsapp={whatsapp} initialShipping={rows} />
}
