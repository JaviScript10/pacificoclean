'use client'

import { useActionState } from 'react'
import { login } from '../actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined)

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-5"
      >
        <div className="text-center">
          <h1 className="text-2xl font-black text-[#0A4D94]">
            Pacífico<span className="text-emerald-500">Clean</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Panel de administración</p>
        </div>

        {state?.error && (
          <p role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-3 rounded-xl">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-600 mb-1">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0A4D94]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold text-slate-600 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0A4D94]"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#0A4D94] hover:bg-[#083b73] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
        >
          {pending ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}
