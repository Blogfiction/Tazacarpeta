import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { AuthService } from '../services/auth'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  setDevSession: (session: Session | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener la sesión inicial usando nuestro sistema personalizado
    const initializeAuth = async () => {
      try {
        const session = await AuthService.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Verificar sesión periódicamente (cada 5 minutos)
    const interval = setInterval(async () => {
      try {
        const session = await AuthService.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking session:', error)
        setSession(null)
        setUser(null)
      }
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [])

  const setDevSession = (devSession: Session | null) => {
    console.log('Estableciendo sesión de desarrollo:', devSession);
    setSession(devSession)
    setUser(devSession?.user ?? null)
    setLoading(false)
  }

  const value = {
    session,
    user,
    loading,
    setDevSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}