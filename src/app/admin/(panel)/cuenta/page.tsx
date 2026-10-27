import { requireAdmin } from '@/lib/auth'
import { PasswordForm } from './password-form'

export default async function CuentaPage() {
  const { user } = await requireAdmin()

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Mi cuenta</h1>
        <p className="text-sm text-slate-500">
          Conectado como <strong className="text-slate-700">{user.email}</strong>
        </p>
      </div>
      <PasswordForm />
    </div>
  )
}
