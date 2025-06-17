// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { authService } from '../services/authService'
import type { User } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    getInitialUser()

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await authService.getCurrentUser()
          setUser(profile)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getInitialUser = async () => {
    try {
      const profile = await authService.getCurrentUser()
      setUser(profile)
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { data, error } = await authService.signIn(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
      return { error }
    }
    
    const profile = await authService.getCurrentUser()
    setUser(profile)
    setLoading(false)
    
    return { data, error: null }
  }

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    role: string
    phone?: string
  }) => {
    setLoading(true)
    setError(null)
    
    const { data, error } = await authService.signUp(email, password, userData)
    
    if (error) {
      setError(error.message)
      setLoading(false)
      return { error }
    }
    
    setLoading(false)
    return { data, error: null }
  }

  const signOut = async () => {
    setLoading(true)
    const { error } = await authService.signOut()
    
    if (!error) {
      setUser(null)
    }
    
    setLoading(false)
    return { error }
  }

  // Connexion rapide pour les tests (sans mot de passe) - VERSION DEBUG
  const signInAsTestUser = async (email: string) => {
    setLoading(true)
    setError(null)
    
    console.log('🔍 DEBUG - Connexion pour:', email)
    console.log('🔍 DEBUG - Environnement:', process.env.NODE_ENV)
    
    try {
      const { data: testUser, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      console.log('🔍 DEBUG - Réponse Supabase:', { testUser, queryError })
      
      if (queryError) {
        console.error('🔍 DEBUG - Erreur requête:', queryError)
        setError(`Erreur requête: ${queryError.message}`)
        setLoading(false)
        return { user: null, error: queryError.message }
      }

      if (testUser) {
        console.log('✅ DEBUG - Utilisateur trouvé:', testUser)
        setUser(testUser)
      } else {
        console.log('❌ DEBUG - Aucun utilisateur trouvé pour:', email)
        setError('Utilisateur de test non trouvé')
      }
      
      setLoading(false)
      return { user: testUser, error: testUser ? null : 'Utilisateur non trouvé' }
      
    } catch (catchError) {
      console.error('🔍 DEBUG - Erreur catch:', catchError)
      const errorMessage = catchError instanceof Error ? catchError.message : 'Erreur inconnue'
      setError(`Erreur connexion: ${errorMessage}`)
      setLoading(false)
      return { user: null, error: errorMessage }
    }
  }

  return { 
    user, 
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInAsTestUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
    isVolunteer: user?.role === 'volunteer',
    isTeamDirector: user?.role === 'team_director'
  }
}