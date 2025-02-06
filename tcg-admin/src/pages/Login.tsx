import { LogIn } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { session } = useAuth()

  useEffect(() => {
    if (session) {
      navigate('/dashboard')
    }
  }, [session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      if (signInError) {
        switch (signInError.message) {
          case 'Invalid login credentials':
            setError('Correo electrónico o contraseña incorrectos')
            break
          case 'Email not confirmed':
            setError('Por favor, confirma tu correo electrónico')
            break
          default:
            setError('Error al iniciar sesión. Por favor, intenta de nuevo.')
        }
        console.error('Auth error:', signInError)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Error al conectar con el servidor. Por favor, intenta de nuevo más tarde.')
    } finally {
      setLoading(false)
    }
  }

  if (session) return null

  return (
    <div className="min-h-screen bg-[#FFFFE0] flex flex-col items-center justify-center p-4">
      <div className="scanlines"></div>
      <div className="retro-container bg-white w-full max-w-md">
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 mx-auto mb-4 text-gray-800" />
          <h1 className="font-press-start text-xl text-gray-800">Iniciar Sesión</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg pixel-corners" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block font-press-start text-xs text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="retro-input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-press-start text-xs text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="retro-input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="retro-button w-full justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 font-press-start">
          ¿No tienes una cuenta?{' '}
          <Link to="/signup" className="text-gray-800 hover:text-gray-600">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}