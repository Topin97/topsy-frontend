import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { authApi, storageApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROLE_LABEL = { client: 'Cliente', professional: 'Profesional', admin: 'Admin' }

function Field({ label, error, focused, children }) {
  return (
    <div>
      <div
        style={{
          background: focused ? 'rgba(184,131,58,0.04)' : '#F7F5F2',
          border: `1.5px solid ${error ? '#dc2626' : focused ? '#B8833A' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 14,
          padding: '12px 16px',
          transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(184,131,58,0.1)' : 'none',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: focused ? '#B8833A' : 'rgba(26,22,18,0.4)',
            marginBottom: 5,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            transition: 'color 0.2s',
          }}
        >
          {label}
        </label>
        {children}
      </div>

      {error && (
        <p
          style={{
            color: '#dc2626',
            fontSize: 12,
            marginTop: 4,
            paddingLeft: 4,
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [focused, setFocused] = useState(null)

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data.user),
  })

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      full_name: me?.full_name ?? '',
      phone: me?.phone ?? '',
      city: me?.city ?? '',
      bio: me?.bio ?? '',
    },
  })

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: ({ data }) => {
      toast.success('Perfil actualizado ✓')
      if (data?.user) setUser(data.user)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err) => toast.error(err.response?.data?.error ?? 'Error al guardar'),
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const url = await storageApi.uploadAvatar(file, user.id)
      setUser({ ...user, avatar_url: url })
      toast.success('Foto actualizada ✨')
      qc.invalidateQueries({ queryKey: ['me'] })
    } catch {
      toast.error('Error al subir la imagen')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
        <div className="skeleton" style={{ height: 150, borderRadius: 24, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 320, borderRadius: 24 }} />
      </div>
    )
  }

  const avatarSrc = preview ?? me?.avatar_url
  const initials = me?.full_name?.slice(0, 2).toUpperCase() ?? 'US'
  const points = me?.points ?? 0
  const nextRewardPoints = 200
  const remainingPoints = Math.max(nextRewardPoints - points, 0)
  const progress = Math.min((points / nextRewardPoints) * 100, 100)

  return (
    <div style={{ background: '#F7F5F2', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 560px) {
          .profile-top-card {
            padding: 20px 16px !important;
          }

          .profile-top-head {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
          }

          .profile-user-main {
            width: 100% !important;
          }

          .profile-avatar-side {
            width: 100% !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-start !important;
            gap: 12px !important;
          }

          .profile-avatar-help {
            text-align: left !important;
          }

          .profile-points-card {
            margin-top: 18px !important;
          }

          .profile-form-grid {
            grid-template-columns: 1fr !important;
          }

          .profile-save-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .profile-save-row p,
          .profile-save-row button {
            width: 100% !important;
          }
        }
      `}</style>

      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          padding: '28px 0 22px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
          marginBottom: 28,
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
          <p
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#B8833A',
              marginBottom: 8,
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
            }}
          >
            Cuenta
          </p>

          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(1.8rem,4vw,2.6rem)',
              fontWeight: 300,
              color: '#1A1612',
              margin: 0,
            }}
          >
            Mi <em style={{ color: '#B8833A', fontStyle: 'italic' }}>perfil</em>
          </h1>
        </div>
      </div>

      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          className="profile-top-card"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(0,0,0,0.08)',
            borderRadius: 24,
            padding: '24px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          <div
            className="profile-top-head"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 18,
              marginBottom: 18,
            }}
          >
            <div
              className="profile-avatar-side"
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: avatarSrc ? 'rgba(184,131,58,0.08)' : '#7B1FA2',
                    border: '2px solid rgba(184,131,58,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  }}
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '2rem',
                        color: '#FFFFFF',
                        fontWeight: 700,
                      }}
                    >
                      {initials}
                    </span>
                  )}
                </div>

                {uploading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: 'rgba(247,245,242,0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        border: '2px solid rgba(184,131,58,0.3)',
                        borderTopColor: '#B8833A',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="profile-avatar-help" style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    background: '#F7F5F2',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: 12,
                    color: 'rgba(26,22,18,0.72)',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {uploading ? 'Subiendo...' : 'Cambiar foto'}
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />

                <p
                  style={{
                    fontSize: 11,
                    color: 'rgba(26,22,18,0.3)',
                    marginTop: 6,
                    marginBottom: 0,
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.3,
                  }}
                >
                  JPG, PNG o WebP
                </p>
              </div>
            </div>

            <div className="profile-user-main" style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.8rem',
                  fontWeight: 500,
                  color: '#1A1612',
                  margin: '2px 0 8px',
                  lineHeight: 1.05,
                }}
              >
                {me?.full_name}
              </h2>

              <p
                style={{
                  fontSize: 12,
                  color: '#B8833A',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  margin: 0,
                  background: 'rgba(184,131,58,0.08)',
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 100,
                }}
              >
                {ROLE_LABEL[me?.role] ?? me?.role}
              </p>
            </div>
          </div>

          <div
            className="profile-points-card"
            style={{
              background: 'linear-gradient(180deg, #FFFEFC 0%, #FBF9F5 100%)',
              border: '1.5px solid rgba(184,131,58,0.22)',
              borderRadius: 24,
              padding: '20px 18px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>⭐</span>
              <span
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.35rem',
                  color: '#1A1612',
                  fontWeight: 500,
                }}
              >
                TopSy Points
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 10,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: '#1A1612',
                  lineHeight: 1,
                }}
              >
                {points}
              </span>

              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1rem',
                  color: 'rgba(26,22,18,0.72)',
                  fontWeight: 500,
                }}
              >
                puntos
              </span>
            </div>

            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                lineHeight: 1.5,
                color: 'rgba(26,22,18,0.68)',
                marginTop: 0,
                marginBottom: 14,
              }}
            >
              {remainingPoints > 0 ? (
                <>
                  Te faltan <strong style={{ color: '#1A1612' }}>{remainingPoints} puntos</strong> para conseguir{' '}
                  <strong style={{ color: '#1A1612' }}>10€</strong> de descuento
                </>
              ) : (
                <>
                  Ya puedes canjear tu recompensa de <strong style={{ color: '#1A1612' }}>10€</strong> de descuento
                </>
              )}
            </p>

            <div
              style={{
                height: 8,
                background: 'rgba(0,0,0,0.08)',
                borderRadius: 999,
                overflow: 'hidden',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg,#B8833A,#D4A055)',
                  transition: 'width 0.35s ease',
                }}
              />
            </div>

            <button
              type="button"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(184,131,58,0.18)',
                borderRadius: 999,
                padding: '13px 18px',
                minWidth: 220,
                maxWidth: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                color: '#B8833A',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              Ver recompensas
              <span style={{ fontSize: 24, lineHeight: 0.8 }}>›</span>
            </button>
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(0,0,0,0.08)',
            borderRadius: 24,
            padding: '24px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#B8833A',
              marginBottom: 20,
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
            }}
          >
            Información personal
          </p>

          <form onSubmit={handleSubmit((d) => saveProfile(d))} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nombre completo" focused={focused === 'name'}>
                <input
                  {...register('full_name')}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#1A1612',
                    fontSize: 15,
                    fontFamily: 'Outfit, sans-serif',
                    padding: 0,
                  }}
                />
              </Field>

              <Field label="Teléfono" focused={focused === 'phone'}>
                <input
                  {...register('phone')}
                  placeholder="+34 600 000 000"
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#1A1612',
                    fontSize: 15,
                    fontFamily: 'Outfit, sans-serif',
                    padding: 0,
                  }}
                />
              </Field>
            </div>

            <Field label="Ciudad" focused={focused === 'city'}>
              <input
                {...register('city')}
                placeholder="Madrid"
                onFocus={() => setFocused('city')}
                onBlur={() => setFocused(null)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#1A1612',
                  fontSize: 15,
                  fontFamily: 'Outfit, sans-serif',
                  padding: 0,
                }}
              />
            </Field>

            <Field label="Bio" focused={focused === 'bio'}>
              <textarea
                {...register('bio')}
                placeholder="Cuéntanos algo sobre ti..."
                rows={3}
                onFocus={() => setFocused('bio')}
                onBlur={() => setFocused(null)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#1A1612',
                  fontSize: 15,
                  fontFamily: 'Outfit, sans-serif',
                  padding: 0,
                  resize: 'none',
                }}
              />
            </Field>

            <div
              className="profile-save-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid rgba(0,0,0,0.06)',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(26,22,18,0.35)',
                  fontFamily: 'Outfit, sans-serif',
                  margin: 0,
                }}
              >
                {me?.email}
              </p>

              <button
                type="submit"
                disabled={!isDirty || saving}
                style={{
                  background: (!isDirty || saving)
                    ? 'rgba(184,131,58,0.35)'
                    : 'linear-gradient(135deg,#B8833A,#D4A055)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '11px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: (!isDirty || saving) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  boxShadow: (!isDirty || saving) ? 'none' : '0 4px 14px rgba(184,131,58,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        {me?.role === 'professional' && (
          <div
            style={{
              background: 'rgba(184,131,58,0.06)',
              border: '1.5px solid rgba(184,131,58,0.2)',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#1A1612',
                  fontFamily: 'Outfit, sans-serif',
                  marginBottom: 2,
                  marginTop: 0,
                }}
              >
                Panel profesional
              </p>

              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(26,22,18,0.45)',
                  fontFamily: 'Outfit, sans-serif',
                  margin: 0,
                }}
              >
                Gestiona servicios, horarios y tu perfil público
              </p>
            </div>

            <Link
              to="/pro/dashboard"
              style={{
                background: 'linear-gradient(135deg,#B8833A,#D4A055)',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(184,131,58,0.25)',
              }}
            >
              Ir al panel →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}