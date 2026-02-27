import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { profApi, authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'

const CATEGORIES = [
  { value: 'hair',      label: '💇 Peluquería' },
  { value: 'nails',     label: '💅 Uñas' },
  { value: 'spa',       label: '🧖 Spa' },
  { value: 'barber',    label: '🪒 Barbería' },
  { value: 'aesthetic', label: '✨ Estética' },
  { value: 'brows',     label: '👁️ Cejas' },
]

export default function ProProfilePage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data.user),
  })

  const hasProfile = !!me?.professional_profiles

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    values: {
      business_name: me?.professional_profiles?.business_name ?? '',
      description:   me?.professional_profiles?.description   ?? '',
      category:      me?.professional_profiles?.category      ?? 'hair',
      address:       me?.professional_profiles?.address       ?? '',
      city:          me?.professional_profiles?.city          ?? '',
    },
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data) => hasProfile ? profApi.update(data) : profApi.create(data),
    onSuccess: () => {
      toast.success(hasProfile ? 'Perfil actualizado ✓' : 'Perfil profesional creado ✓')
      qc.invalidateQueries({ queryKey: ['me'] })
      setCreating(false)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

  if (isLoading) return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 700 }}>
      <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
    </div>
  )

  return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 700 }}>
      <p className="section-tag" style={{ marginBottom: 8 }}>Panel profesional</p>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, marginBottom: 32 }}>
        Perfil del <em style={{ color: '#C9965A' }}>negocio</em>
      </h1>

      {!hasProfile && !creating && (
        <div className="card" style={{ padding: 48, textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>✂️</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: 8 }}>
            Crea tu perfil profesional
          </h2>
          <p style={{ color: 'rgba(247,242,234,0.4)', fontSize: 14, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            Los clientes verán tu perfil al buscar profesionales. Complétalo para empezar a recibir citas.
          </p>
          <button onClick={() => setCreating(true)} className="btn-primary" style={{ padding: '12px 32px' }}>
            Crear perfil ahora
          </button>
        </div>
      )}

      {(hasProfile || creating) && (
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit((d) => save(d))}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>
                Nombre del negocio *
              </label>
              <input
                {...register('business_name', { required: 'Campo requerido' })}
                placeholder="Ej: Salón Lucía García"
                className="input"
              />
              {errors.business_name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.business_name.message}</p>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>
                Categoría *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <label key={cat.value} style={{ cursor: 'pointer' }}>
                    <input {...register('category')} type="radio" value={cat.value} style={{ display: 'none' }} />
                    <div style={{
                      padding: '10px 12px', borderRadius: 10, fontSize: 13, textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s', cursor: 'pointer',
                    }}
                      className="cat-option"
                    >
                      {cat.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>
                Descripción
              </label>
              <textarea
                {...register('description')}
                placeholder="Describe tu negocio, especialidades, experiencia..."
                className="input"
                style={{ height: 100, resize: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>
                  Dirección
                </label>
                <input {...register('address')} placeholder="Calle Mayor 1" className="input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>
                  Ciudad *
                </label>
                <input
                  {...register('city', { required: 'Ciudad requerida' })}
                  placeholder="Madrid"
                  className="input"
                />
                {errors.city && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.city.message}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {creating && !hasProfile && (
                <button type="button" onClick={() => setCreating(false)} className="btn-ghost">
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={isPending || (!isDirty && hasProfile)}
                className="btn-primary"
                style={{ padding: '10px 32px' }}
              >
                {isPending ? 'Guardando...' : hasProfile ? 'Guardar cambios' : 'Crear perfil'}
              </button>
            </div>
          </form>
        </div>
      )}

      {hasProfile && (
        <div className="card" style={{ padding: 20, marginTop: 20 }}>
          <p className="section-tag" style={{ marginBottom: 12, fontSize: 10 }}>Estado del perfil</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: me?.professional_profiles?.is_active ? '#4ade80' : '#f87171' }} />
              <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.6)' }}>
                {me?.professional_profiles?.is_active ? 'Perfil activo' : 'Perfil inactivo'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: me?.professional_profiles?.is_verified ? '#C9965A' : 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: 13, color: 'rgba(247,242,234,0.6)' }}>
                {me?.professional_profiles?.is_verified ? '✓ Verificado' : 'Pendiente de verificación'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}