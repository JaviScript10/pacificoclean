'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { changePassword } from './actions'

const inputClass =
  'w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 pr-11 text-sm focus:outline-none focus:border-[#0A4D94]'
const labelClass = 'block text-xs font-bold text-slate-600 mb-1'

function PasswordField({
  id,
  label,
  autoComplete,
  show,
}: {
  id: string
  label: string
  autoComplete: string
  show: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        id={id}
        name={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        className={inputClass}
      />
    </div>
  )
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined)
  const [show, setShow] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Al cambiarla con éxito, se limpian los campos
  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-900">Cambiar contraseña</h2>
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {show ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {state?.error && (
        <p role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-3 rounded-xl">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold p-3 rounded-xl">
          ✓ Contraseña cambiada. Se cerró la sesión en los demás dispositivos.
        </p>
      )}

      <PasswordField id="current" label="Contraseña actual" autoComplete="current-password" show={show} />
      <PasswordField id="next" label="Nueva contraseña" autoComplete="new-password" show={show} />
      <PasswordField id="confirm" label="Repite la nueva contraseña" autoComplete="new-password" show={show} />

      <p className="text-xs text-slate-500">Mínimo 10 caracteres, con letras y números. Evita usar datos personales como nombres o fechas.</p>

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#0A4D94] hover:bg-[#083b73] disabled:opacity-60 cursor-pointer"
      >
        {pending ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
