import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function ReviewPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const token = useAuthStore((s) => s.token)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-review', bookingId],
    queryFn: () => api.get(`/bookings/${bookingId}`).then(r => r.data.data),
    enabled: !!token,
  })

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => api.post(`/bookings/${bookingId}/review`, { rating, comment }),
    onSuccess: () => {
      setDone(true)
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['booking-review', bookingId] })
    },
    onError: (err) => {
      const msg = err.response?.data?.error ?? 'Error al enviar'
      if (msg.includes('Ya valoraste')) {
        toast('Ya habías valorado esta cita', { icon: 'ℹ️' })
        setDone(true)
      } else {
        toast.error(msg)
      }
    },
  })

  const alreadyReviewed = booking?.reviews?.length > 0

  if (!token) return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Outfit, sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>⭐</div>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#1A1612', marginBottom: 8 }}>
          Deja tu <em style={{ color: '#B8833A' }}>valoración</em>
        </p>
        <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.45)', lineHeight: 1.6, marginBottom: 32 }}>
          Inicia sesión para valorar tu cita y ayudar a otros clientes.
        </p>
        <Link
          to={`/login?next=${encodeURIComponent(`/review/${bookingId}`)}`}
          style={{ display: 'block', width: '100%', padding: '15px', background: 'linear-gradient(135deg,#1A1612,#2C1810)', border: 'none', borderRadius: 14, color: '#FFFFFF', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textDecoration: 'none', boxSizing: 'border-box' }}>
          Iniciar sesión →
        </Link>
      </div>
    </div>
  )

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(184,131,58,0.15)', borderTopColor: '#B8833A', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error || !booking) return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: 'rgba(26,22,18,0.3)', fontStyle: 'italic' }}>Reserva no encontrada</p>
      <button onClick={() => navigate('/')} style={{ marginTop: 16, fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#B8833A', background: 'none', border: 'none', cursor: 'pointer' }}>Ir al inicio →</button>
    </div>
  )

  const profName    = booking.professional_profiles?.business_name ?? booking.professionals?.business_name ?? 'Profesional'
  const serviceName = booking.services?.name ?? 'Servicio'
  const startsAt    = booking.starts_at ? new Date(booking.starts_at) : null

  // Estado: ya valorada
  if (done || alreadyReviewed) return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#1A1612', marginBottom: 8 }}>
          ¡Gracias por tu <em style={{ color: '#B8833A' }}>valoración!</em>
        </p>
        <p style={{ fontSize: 14, color: 'rgba(26,22,18,0.45)', lineHeight: 1.6, marginBottom: 32 }}>
          Tu opinión ayuda a {profName} a mejorar y a otros clientes a elegir con confianza.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#1A1612,#2C1810)', border: 'none', borderRadius: 14, color: '#FFFFFF', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
          Ver mis citas →
        </button>
        <button
          onClick={() => navigate(`/professional/${booking.professional_id}`)}
          style={{ width: '100%', padding: '13px', background: 'none', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 14, color: 'rgba(26,22,18,0.5)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', marginTop: 10 }}>
          Ver perfil de {profName}
        </button>
      </div>
    </div>
  )

  // Solo se puede valorar si está completada
  if (booking.status !== 'completed') return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#1A1612', marginBottom: 8 }}>Cita aún no completada</p>
        <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.45)', marginBottom: 28 }}>Podrás dejar tu valoración cuando el profesional marque la cita como completada.</p>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#B8833A', background: 'none', border: 'none', cursor: 'pointer' }}>← Volver al panel</button>
      </div>
    </div>
  )

  const activeStars = hovered || rating

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        .star-btn { background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.12s; font-size: 44px; line-height: 1; }
        .star-btn:hover { transform: scale(1.15); }
        .review-textarea:focus { outline: none; border-color: rgba(184,131,58,0.4) !important; }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .submit-btn { transition: all 0.18s; }
      `}</style>

      <div style={{ maxWidth: 440, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 300, color: '#1A1612', margin: '0 0 6px', lineHeight: 1.2 }}>
            ¿Cómo fue tu cita<br />en <em style={{ color: '#B8833A' }}>{profName}</em>?
          </p>
          {startsAt && (
            <p style={{ fontSize: 13, color: 'rgba(26,22,18,0.4)', margin: 0 }}>
              {format(startsAt, "EEEE d 'de' MMMM", { locale: es })} · {serviceName}
            </p>
          )}
        </div>

        {/* Tarjeta principal */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '32px 24px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

          {/* Estrellas */}
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.35)', textAlign: 'center', marginBottom: 16, fontWeight: 700 }}>Tu puntuación</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                className="star-btn"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i)}
                style={{ color: i <= activeStars ? '#B8833A' : 'rgba(26,22,18,0.12)' }}
              >
                ★
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(26,22,18,0.4)', marginBottom: 28, minHeight: 20 }}>
            {activeStars === 1 && 'Muy mala experiencia'}
            {activeStars === 2 && 'Podría mejorar'}
            {activeStars === 3 && 'Normal, sin más'}
            {activeStars === 4 && 'Muy buena cita'}
            {activeStars === 5 && '¡Excelente! Totalmente recomendable'}
          </p>

          {/* Comentario */}
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(26,22,18,0.35)', marginBottom: 10, fontWeight: 700 }}>
            Comentario <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(opcional)</span>
          </p>
          <textarea
            className="review-textarea"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={`¿Qué destacarías de ${profName}? Trato, resultado, puntualidad...`}
            maxLength={500}
            rows={4}
            style={{ width: '100%', background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: 'Outfit, sans-serif', color: '#1A1612', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
          <p style={{ fontSize: 11, color: 'rgba(26,22,18,0.25)', textAlign: 'right', margin: '4px 0 24px' }}>{comment.length}/500</p>

          {/* Botón */}
          <button
            className="submit-btn"
            onClick={() => submit()}
            disabled={isPending || rating === 0}
            style={{ width: '100%', padding: '15px', background: rating === 0 ? 'rgba(26,22,18,0.08)' : 'linear-gradient(135deg,#1A1612,#2C1810)', border: 'none', borderRadius: 14, color: rating === 0 ? 'rgba(26,22,18,0.3)' : '#FFFFFF', fontSize: 15, fontWeight: 700, cursor: rating === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.18s' }}>
            {isPending ? 'Enviando...' : rating === 0 ? 'Selecciona una puntuación' : `Enviar valoración — ${rating} ★`}
          </button>
        </div>

        <button onClick={() => navigate('/dashboard')} style={{ display: 'block', width: '100%', marginTop: 16, padding: '12px', background: 'none', border: 'none', color: 'rgba(26,22,18,0.35)', fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
          Omitir por ahora
        </button>
      </div>
    </div>
  )
}
