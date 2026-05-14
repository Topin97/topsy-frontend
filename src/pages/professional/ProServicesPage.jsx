import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '../../services/api'
import toast from 'react-hot-toast'

const inputStyle = {
  width: '100%', background: 'none', border: 'none', outline: 'none',
  color: '#1A1612', fontSize: 15, fontFamily: 'Outfit, sans-serif', padding: 0,
  boxSizing: 'border-box',
}

function Field({ label, error, children }) {
  return (
    <div>
      <div style={{ background: '#F7F5F2', border: `1.5px solid ${error ? '#dc2626' : 'rgba(0,0,0,0.1)'}`, borderRadius: 12, padding: '11px 14px' }}>
        <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.4)', marginBottom: 4, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{label}</label>
        {children}
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>{error}</p>}
    </div>
  )
}

function ServiceForm({ onSubmit, onCancel, defaultValues }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  return (
    <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(184,131,58,0.25)', borderRadius: 18, padding: '22px 20px', marginBottom: 16, boxShadow: '0 4px 20px rgba(184,131,58,0.08)' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 16, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
        {defaultValues ? 'Editar servicio' : 'Nuevo servicio'}
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Nombre del servicio" error={errors.name && 'Requerido'}>
              <input {...register('name', { required: true })} placeholder="Ej: Corte y peinado" style={inputStyle} />
            </Field>
          </div>
          <Field label="Precio (€)" error={errors.price && 'Requerido'}>
            <input {...register('price', { required: true, min: 0 })} type="number" placeholder="25" style={inputStyle} />
          </Field>
          <Field label="Duración (min)" error={errors.duration_minutes && 'Requerido'}>
            <input {...register('duration_minutes', { required: true, min: 5 })} type="number" placeholder="60" style={inputStyle} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Descripción (opcional)">
              <textarea {...register('description')} placeholder="Describe el servicio..." style={{ ...inputStyle, height: 72, resize: 'none' }} />
            </Field>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ background: 'none', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '9px 20px', fontSize: 13, color: 'rgba(26,22,18,0.5)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            Cancelar
          </button>
          <button type="submit" style={{ background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 10, padding: '9px 24px', fontSize: 13, color: '#FFFFFF', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, boxShadow: '0 4px 12px rgba(184,131,58,0.25)' }}>
            Guardar
          </button>
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

  const { mutate: saveService } = useMutation({
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

  const { mutate: deleteService } = useMutation({
    mutationFn: (id) => api.delete(`/professionals/services/${id}`).then(r => r.data),
    onSuccess: (data) => {
      if (data?.soft) {
        toast.success(data.message ?? 'Servicio desactivado', { duration: 5000, icon: 'ℹ️' })
      } else {
        toast.success('Servicio eliminado ✓')
      }
      qc.invalidateQueries({ queryKey: ['my-services'] })
    },
    onError: (err) => {
      const msg = err.response?.data?.error ?? 'Error al eliminar'
      toast.error(msg, { duration: 5000 })
    },
  })

  const handleDelete = (service) => {
    if (window.confirm(`¿Eliminar "${service.name}" definitivamente?\n\nSi tiene reservas activas no podrá eliminarse, solo desactivarse.`)) {
      deleteService(service.id)
    }
  }

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 60 }}>
      <style>{`
        .svc-card { transition: box-shadow 0.2s, border-color 0.2s; }
        .svc-card:hover { border-color: rgba(184,131,58,0.2) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.07) !important; }
        .toggle-btn:hover { background: rgba(184,131,58,0.08) !important; border-color: rgba(184,131,58,0.25) !important; color: #B8833A !important; }
        .edit-btn:hover { background: rgba(26,22,18,0.05) !important; }
        .delete-btn:hover { background: rgba(220,38,38,0.08) !important; border-color: rgba(220,38,38,0.3) !important; color: #dc2626 !important; }
        .svc-actions { display: flex; gap: 8px; flex-shrink: 0; }
        @media (max-width: 480px) {
          .svc-card-inner { flex-wrap: wrap; }
          .svc-price { order: -1; margin-left: auto; }
          .svc-actions { width: 100%; margin-top: 8px; }
          .svc-actions button { flex: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '28px 0 22px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 28 }}>
        <div className="container-app" style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8833A', marginBottom: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Panel profesional</p>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 300, color: '#1A1612' }}>
                Mis <em style={{ color: '#B8833A' }}>servicios</em>
              </h1>
            </div>
            <button onClick={() => { setShowForm(true); setEditingId(null) }} style={{
              background: 'linear-gradient(135deg,#B8833A,#D4A055)', border: 'none', borderRadius: 12,
              padding: '11px 20px', fontSize: 13, fontWeight: 700, color: '#FFFFFF',
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 14px rgba(184,131,58,0.25)',
              whiteSpace: 'nowrap',
            }}>
              + Nuevo servicio
            </button>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: '0 16px', maxWidth: 800 }}>

        {showForm && !editingId && (
          <ServiceForm onSubmit={(d) => saveService(d)} onCancel={() => setShowForm(false)} />
        )}

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 18 }} />)}
          </div>
        ) : !services?.length ? (
          <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '60px 24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✂️</div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontStyle: 'italic', color: '#1A1612' }}>Sin servicios aún</p>
            <p style={{ fontSize: 13, marginTop: 8, color: 'rgba(26,22,18,0.4)', fontFamily: 'Outfit, sans-serif' }}>Añade tu primer servicio para que los clientes puedan reservar</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {services?.map((s) => (
              <div key={s.id}>
                {editingId === s.id ? (
                  <ServiceForm
                    defaultValues={s}
                    onSubmit={(d) => saveService({ ...d, id: s.id })}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="svc-card" style={{
                    background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 16,
                    padding: '18px 20px', opacity: s.is_active ? 1 : 0.55, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                  <div className="svc-card-inner" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Number circle */}
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: s.is_active ? 'rgba(184,131,58,0.1)' : 'rgba(0,0,0,0.05)', border: `1.5px solid ${s.is_active ? 'rgba(184,131,58,0.25)' : 'rgba(0,0,0,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: s.is_active ? '#B8833A' : 'rgba(26,22,18,0.3)' }}>✂️</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 14, color: '#1A1612', fontFamily: 'Outfit, sans-serif' }}>{s.name}</h3>
                        {!s.is_active && <span style={{ fontSize: 10, color: 'rgba(26,22,18,0.35)', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)', padding: '2px 8px', borderRadius: 100, fontFamily: 'Outfit, sans-serif' }}>Desactivado</span>}
                      </div>
                      {s.description && <p style={{ fontSize: 12, color: 'rgba(26,22,18,0.45)', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>{s.description}</p>}
                      <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.35)', fontFamily: 'Outfit, sans-serif' }}>⏱ {s.duration_minutes} min</p>
                    </div>
                    <span className="svc-price" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#B8833A', fontStyle: 'italic', flexShrink: 0 }}>{s.price}€</span>
                    <div className="svc-actions">
                      <button onClick={() => setEditingId(s.id)} className="edit-btn" style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 9, padding: '7px 14px', fontSize: 12, color: 'rgba(26,22,18,0.6)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'all 0.2s' }}>
                        Editar
                      </button>
                      <button onClick={() => toggleService({ id: s.id, is_active: !s.is_active })} className="toggle-btn" style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 9, padding: '7px 14px', fontSize: 12, color: 'rgba(26,22,18,0.6)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'all 0.2s' }}>
                        {s.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button onClick={() => handleDelete(s)} className="delete-btn" title="Eliminar servicio" style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 9, padding: '7px 12px', fontSize: 14, color: 'rgba(26,22,18,0.5)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'all 0.2s' }}>
                        🗑️
                      </button>
                    </div>
                  </div>{/* svc-card-inner */}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
