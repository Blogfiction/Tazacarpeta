import { UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido')
      return
    }

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login'
        }
      })
      
      if (error) {
        switch (error.message) {
          case 'User already registered':
            setError('Este correo electrónico ya está registrado')
            break
          case 'Password should be at least 6 characters':
            setError('La contraseña debe tener al menos 6 caracteres')
            break
          case 'Database error saving new user':
            setError('Error al crear el usuario. Por favor, intenta de nuevo más tarde')
            break
          default:
            setError(error.message)
        }
      } else if (data.user) {
        setSuccess('Registro exitoso. Redirigiendo al login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFE0] flex flex-col items-center justify-center p-4">
      <div className="scanlines"></div>
      <div className="retro-container bg-white w-full max-w-md">
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-800" />
          <h1 className="font-press-start text-xl text-gray-800">Crear Cuenta</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg pixel-corners" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg pixel-corners" role="alert">
            {success}
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
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500 font-press-start">
              Mínimo 6 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block font-press-start text-xs text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="retro-input"
              required
              disabled={loading}
              minLength={6}
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
                Registrando...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 font-press-start">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-gray-800 hover:text-gray-600">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}