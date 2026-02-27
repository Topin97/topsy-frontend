import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '../../services/api'
import toast from 'react-hot-toast'

function ServiceForm({ onSubmit, onCancel, defaultValues }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  return (
    <div className="card" style={{ padding: 24, marginBottom: 16, border: '1px solid rgba(201,150,90,0.3)' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Nombre del servicio</label>
            <input {...register('name', { required: true })} placeholder="Ej: Corte y peinado" className="input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Precio (€)</label>
            <input {...register('price', { required: true, min: 0 })} type="number" placeholder="25" className="input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Duración (min)</label>
            <input {...register('duration_minutes', { required: true, min: 5 })} type="number" placeholder="60" className="input" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(247,242,234,0.4)', marginBottom: 8 }}>Descripción (opcional)</label>
            <textarea {...register('description')} placeholder="Describe el servicio..." className="input" style={{ height: 80, resize: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
          <button type="submit" className="btn-primary" style={{ padding: '8px 24px' }}>Guardar</button>
        </div>
      </form>
    </div>
  )
}

export default function ProServicesPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const { data: profile } = useQuery({
    queryKey: ['my-pro-profile'],
    queryFn: () => api.get('/professionals/me/stats').then(() =>
      api.get('/auth/me').then((r) => r.data.user?.professional_profiles)
    ),
  })

  const proId = profile?.id

  const { data: services, isLoading } = useQuery({
    queryKey: ['my-services', proId],
    queryFn: () => api.get(`/professionals/${proId}`).then((r) => r.data.data?.services ?? []),
    enabled: !!proId,
  })

  const { mutate: saveService, isPending } = useMutation({
    mutationFn: (data) => api.post('/professionals/services', data),
    onSuccess: () => {
      toast.success('Servicio guardado ✓')
      qc.invalidateQueries({ queryKey: ['my-services'] })
      setShowForm(false)
      setEditingId(null)
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

  const { mutate: toggleService } = useMutation({
    mutationFn: ({ id, is_active }) => api.patch(`/professionals/services/${id}`, { is_active }),
    onSuccess: () => {
      toast.success('Servicio actualizado')
      qc.invalidateQueries({ queryKey: ['my-services'] })
    },
  })

  return (
    <div className="container-app" style={{ padding: '40px 24px', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <p className="section-tag" style={{ marginBottom: 8 }}>Panel profesional</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300 }}>
            Mis <em style={{ color: '#C9965A' }}>servicios</em>
          </h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null) }} className="btn-primary" style={{ padding: '10px 20px' }}>
          + Nuevo servicio
        </button>
      </div>

      {showForm && !editingId && (
        <ServiceForm
          onSubmit={(d) => saveService(d)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 20 }} />)}
        </div>
      ) : services?.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', color: 'rgba(247,242,234,0.25)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✂️</div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontStyle: 'italic' }}>Sin servicios aún</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Añade tu primer servicio para que los clientes puedan reservar</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {services?.map((s) => (
            <div key={s.id}>
              {editingId === s.id ? (
                <ServiceForm
                  defaultValues={s}
                  onSubmit={(d) => saveService({ ...d, id: s.id })}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, opacity: s.is_active ? 1 : 0.5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontWeight: 600 }}>{s.name}</h3>
                      {!s.is_active && <span style={{ fontSize: 11, color: 'rgba(247,242,234,0.3)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 100 }}>Desactivado</span>}
                    </div>
                    {s.description && <p style={{ fontSize: 13, color: 'rgba(247,242,234,0.4)', marginBottom: 4 }}>{s.description}</p>}
                    <p style={{ fontSize: 12, color: 'rgba(247,242,234,0.3)' }}>⏱ {s.duration_minutes} min</p>
                  </div>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#C9965A', fontStyle: 'italic' }}>{s.price}€</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditingId(s.id)} className="btn-ghost" style={{ fontSize: 12, border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 8 }}>Editar</button>
                    <button
                      onClick={() => toggleService({ id: s.id, is_active: !s.is_active })}
                      className="btn-ghost"
                      style={{ fontSize: 12, border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 8 }}
                    >
                      {s.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}