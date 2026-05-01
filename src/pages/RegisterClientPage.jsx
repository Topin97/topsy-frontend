import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import toast from 'react-hot-toast'
import { useState } from 'react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.5-.2-3-.4-4.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 16.3 5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c4.9 0 9.3-1.9 12.7-4.9l-5.9-5c-1.9 1.4-4.2 2.2-6.8 2.2-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.5 41 16.3 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.3l5.9 5C37 38.8 44 33 44 25c0-1.5-.2-3-.4-4.5z"/>
    </svg>
  )
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          color: 'rgba(26,22,18,0.45)',
          marginBottom: 8,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500,
        }}
      >
        {label}
      </label>

      <div
        style={{
          background: '#FFFFFF',
          border: `1px solid ${error ? '#ef4444' : 'rgba(26,22,18,0.12)'}`,
          borderRadius: 16,
          minHeight: 54,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        {children}
      </div>

      {error && (
        <p
          style={{
            color: '#ef4444',
            fontSize: 12,
            marginTop: 6,
            marginBottom: 0,
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default function RegisterClientPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const { loginWithGoogle, loading: googleLoading } = useGoogleAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authApi.register({ ...data, role: 'client' }),
    onSuccess: ({ data }) => {
      if (data.access_token) {
        setAuth(data.user, data.access_token, data.refresh_token)
        toast.success('¡Bienvenido a TopSy! ✨')
        navigate('/')
      } else {
        setSentTo(data.user?.email ?? '')
        setEmailSent(true)
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.error ?? 'Error al registrarse')
    },
  })

  const onSubmit = async (data) => {
    try {
      if (!executeRecaptcha) {
        toast.error('El sistema de seguridad aún no está listo. Inténtalo de nuevo.')
        return
      }

      const token = await executeRecaptcha('register')

      if (!token) {
        toast.error('No se pudo completar la verificación de seguridad.')
        return
      }

      mutate({
        ...data,
        recaptcha_token: token,
      })
    } catch {
      toast.error('Error de verificación de seguridad. Inténtalo de nuevo.')
    }
  }

  if (emailSent) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            height: 74,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(26,22,18,0.06)',
            background: 'rgba(255,255,255,0.92)',
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.8rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textDecoration: 'none',
              color: '#1A1612',
            }}
          >
            TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
          </Link>
        </header>

        <main
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            padding: '36px 20px 56px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(184,131,58,0.08)',
                border: '1px solid rgba(184,131,58,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 24px',
              }}
            >
              ✉️
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(2.2rem, 8vw, 3rem)',
                fontWeight: 500,
                lineHeight: 1.08,
                color: '#1A1612',
              }}
            >
              Revisa tu email
            </h1>

            <p
              style={{
                margin: '12px 0 6px',
                color: 'rgba(26,22,18,0.5)',
                fontSize: 15,
                lineHeight: 1.7,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Hemos enviado un enlace de confirmación a
            </p>

            <p
              style={{
                margin: 0,
                color: '#B8833A',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {sentTo}
            </p>

            <div
              style={{
                marginTop: 24,
                marginBottom: 24,
                background: '#FFFFFF',
                border: '1px solid rgba(26,22,18,0.08)',
                borderRadius: 18,
                padding: '18px 20px',
                textAlign: 'left',
                boxShadow: '0 2px 10px rgba(26,22,18,0.04)',
              }}
            >
              {[
                'Abre tu bandeja de entrada',
                'Busca un email de citas@topsy.es',
                'Pulsa en el enlace de confirmación',
                'Vuelve e inicia sesión',
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < 3 ? '1px solid rgba(26,22,18,0.06)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'rgba(184,131,58,0.08)',
                      border: '1px solid rgba(184,131,58,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      color: '#B8833A',
                      fontWeight: 700,
                      flexShrink: 0,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {i + 1}
                  </div>

                  <span
                    style={{
                      fontSize: 13,
                      color: 'rgba(26,22,18,0.62)',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/login"
              style={{
                display: 'block',
                background: 'linear-gradient(135deg,#B8833A,#D4A055)',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '16px',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 15,
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 6px 20px rgba(184,131,58,0.22)',
              }}
            >
              Ir al inicio de sesión
            </Link>

            <p
              style={{
                fontSize: 12,
                color: 'rgba(26,22,18,0.32)',
                marginTop: 14,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              ¿No lo ves? Revisa también la carpeta de spam.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .topsy-google-button {
          transition: all 0.18s ease;
        }

        .topsy-google-button:hover {
          transform: translateY(-1px);
          border-color: #cfc7bd !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .topsy-primary-button {
          transition: all 0.22s ease;
        }

        .topsy-primary-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(184,131,58,0.26);
        }
      `}</style>

      <header
        style={{
          height: 74,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(26,22,18,0.06)',
          background: 'rgba(255,255,255,0.92)',
          position: 'relative',
        }}
      >
        <Link
          to="/register"
          style={{
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            textDecoration: 'none',
            color: 'rgba(26,22,18,0.45)',
            fontSize: 14,
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          ← Volver
        </Link>

        <Link
          to="/"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.8rem',
            fontWeight: 700,
            letterSpacing: '3px',
            textDecoration: 'none',
            color: '#1A1612',
          }}
        >
          TOP<span style={{ color: '#B8833A', fontStyle: 'italic' }}>sy</span>
        </Link>
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: '34px 20px 52px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(184,131,58,0.16)',
                background: 'rgba(184,131,58,0.05)',
                color: '#B8833A',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: 16,
              }}
            >
              Cuenta de cliente
            </div>

            <h1
              style={{
                margin: 0,
                color: '#1A1612',
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 500,
                fontSize: 'clamp(2.2rem, 7vw, 3rem)',
                lineHeight: 1.04,
              }}
            >
              Crea tu cuenta
            </h1>

            <p
              style={{
                margin: '12px 0 0',
                color: 'rgba(26,22,18,0.45)',
                fontSize: 15,
                lineHeight: 1.6,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Reserva citas, recibe recordatorios y empieza en menos de un minuto.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loginWithGoogle('client')}
            disabled={googleLoading}
            className="topsy-google-button"
            style={{
              width: '100%',
              height: 54,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: '#FFFFFF',
              border: '1px solid #D9D4CD',
              borderRadius: 18,
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 15,
              fontWeight: 600,
              color: '#1A1612',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              marginBottom: 16,
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            {googleLoading ? (
              <span
                style={{
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(26,22,18,0.12)',
                  borderTopColor: '#B8833A',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              <GoogleIcon />
            )}

            <span>{googleLoading ? 'Conectando...' : 'Continuar con Google'}</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'rgba(26,22,18,0.07)' }} />
            <span
              style={{
                fontSize: 12,
                color: 'rgba(26,22,18,0.3)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              o con email
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(26,22,18,0.07)' }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Field label="Nombre completo" error={errors.full_name?.message}>
              <input
                {...register('full_name', {
                  required: 'Nombre requerido',
                })}
                placeholder="Lucía García"
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#1A1612',
                  fontSize: 16,
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <input
                {...register('email', {
                  required: 'Email requerido',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Email inválido',
                  },
                })}
                type="email"
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#1A1612',
                  fontSize: 16,
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
            </Field>

            <Field label="Teléfono" error={errors.phone?.message}>
              <input
                {...register('phone', {
                  pattern: {
                    value: /^[+0-9()\-\s]{6,20}$/,
                    message: 'Teléfono inválido',
                  },
                })}
                type="tel"
                placeholder="+34 600 000 000"
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#1A1612',
                  fontSize: 16,
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
            </Field>

            <Field label="Contraseña" error={errors.password?.message}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                  {...register('password', {
                    required: 'Contraseña requerida',
                    minLength: {
                      value: 8,
                      message: 'Mínimo 8 caracteres',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#1A1612',
                    fontSize: 16,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(26,22,18,0.3)',
                    fontSize: 16,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={isPending}
              className="topsy-primary-button"
              style={{
                width: '100%',
                height: 56,
                marginTop: 6,
                fontSize: 15,
                fontWeight: 700,
                background: isPending
                  ? 'rgba(184,131,58,0.42)'
                  : 'linear-gradient(135deg,#B8833A,#D4A055)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 18,
                cursor: isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.02em',
                boxShadow: isPending ? 'none' : '0 6px 20px rgba(184,131,58,0.22)',
              }}
            >
              {isPending ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta gratis'
              )}
            </button>

            <p
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: 'rgba(26,22,18,0.32)',
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1.65,
                marginTop: 14,
                marginBottom: 0,
              }}
            >
              Al registrarte aceptas nuestros{' '}
              <span style={{ color: '#B8833A', fontWeight: 600 }}>
                Términos de uso
              </span>
            </p>
          </form>

          <p
            style={{
              textAlign: 'center',
              color: 'rgba(26,22,18,0.35)',
              fontSize: 14,
              marginTop: 24,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              style={{
                color: '#B8833A',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}