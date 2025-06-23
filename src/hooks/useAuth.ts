// src/hooks/useAuth.ts - Version corrigée avec types stricts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { authService } from '../services/authService'
import type { User } from '../lib/supabase'

// ✅ Interface pour le retour du hook
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isTestUser: boolean;
  authType: 'test' | 'supabase';
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any; message: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAsTestUser: (email: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: any }>;
  uploadProfileImage: (file: File) => Promise<any>;
  updateProfile: (updates: Partial<User>) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  isVolunteer: boolean;
  isTeamDirector: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTestUser, setIsTestUser] = useState(false)

  useEffect(() => {
    // Récupérer l'utilisateur actuel au démarrage
    getInitialUser()

    // Écouter les changements d'auth (seulement pour vrais utilisateurs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email)
        
        if (session?.user) {
          // Utilisateur authentifié via Supabase Auth
          const profile = await authService.getCurrentUser()
          setUser(profile)
          setIsTestUser(false)
        } else {
          // Pas d'utilisateur authentifié
          setUser(null)
          setIsTestUser(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getInitialUser = async () => {
    try {
      // Essayer d'abord de récupérer un utilisateur authentifié via Supabase
      const profile = await authService.getCurrentUser()
      setUser(profile)
      setIsTestUser(profile ? authService.isTestUser(profile.email) : false)
    } catch (error) {
      console.error('Erreur récupération utilisateur initial:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Inscription (nouveaux utilisateurs uniquement)
  const signUp = async (email: string, password: string, userData: {
    full_name: string
    role: 'volunteer' | 'team_director' | 'organizer' | 'admin' | 'assistant' | 'artist' | 'attendee'
    phone?: string
    bio?: string
    location?: string
    instagram?: string
    website_url?: string
    experience_years?: number
    specialties?: string[]
  }) => {
    setLoading(true)
    setError(null)
    
    const result = await authService.signUp(email, password, userData)
    
    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return { error: result.error, message: null }
    }
    
    setLoading(false)
    return { 
      error: null, 
      message: result.message || 'Compte créé avec succès !' 
    }
  }

  // Connexion hybride (test + vraie auth)
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const result = await authService.signIn(email, password)
    
    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return { error: result.error }
    }
    
    // Si c'est un utilisateur test, mettre à jour manuellement
    if (authService.isTestUser(email)) {
      const profile = result.data?.user as User
      setUser(profile)
      setIsTestUser(true)
    }
    // Sinon, onAuthStateChange s'en chargera
    
    setLoading(false)
    return { error: null }
  }

  // Connexion test rapide (gardée pour compatibilité)
  const signInAsTestUser = async (email: string): Promise<{ user: User | null; error: string | null }> => {
    setLoading(true)
    setError(null)
    
    console.log('🧪 Connexion test utilisateur:', email)
    
    try {
      const result = await authService.signInAsTestUser(email)
      
      if (result.error) {
        setError(result.error.message)
        setLoading(false)
        return { user: null, error: result.error.message }
      }

      if (result.data?.user) {
        const userProfile = result.data.user as User
        setUser(userProfile)
        setIsTestUser(true)
        setLoading(false)
        return { user: userProfile, error: null }
      }
      
      setError('Utilisateur test non trouvé')
      setLoading(false)
      return { user: null, error: 'Utilisateur non trouvé' }
      
    } catch (error) {
      console.error('Erreur connexion test:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
      setLoading(false)
      return { user: null, error: errorMessage }
    }
  }

  // Déconnexion
  const signOut = async () => {
    setLoading(true)
    
    // Si c'est un utilisateur test, déconnexion manuelle
    if (isTestUser) {
      setUser(null)
      setIsTestUser(false)
      setLoading(false)
      return { error: null }
    }
    
    // Sinon, déconnexion Supabase normale
    const { error } = await authService.signOut()
    
    if (!error) {
      setUser(null)
      setIsTestUser(false)
    }
    
    setLoading(false)
    return { error }
  }

  // Upload de photo de profil
  const uploadProfileImage = async (file: File) => {
    if (!user) {
      return { data: null, error: { message: 'Utilisateur non connecté' } }
    }

    setError(null)
    const result = await authService.uploadProfileImage(user.id, file)
    
    if (result.error) {
      setError(result.error.message)
      return result
    }

    // Mettre à jour l'utilisateur local avec la nouvelle photo
    if (result.data?.url) {
      setUser(prev => prev ? { ...prev, profile_image: result.data!.url } : null)
    }

    return result
  }

  // Mettre à jour le profil
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      return { data: null, error: { message: 'Utilisateur non connecté' } }
    }

    setError(null)
    const result = await authService.updateProfile(user.id, updates)
    
    if (result.error) {
      setError(result.error.message)
      return result
    }

    // Mettre à jour l'utilisateur local
    if (result.data) {
      setUser(result.data)
    }

    return result
  }

  // Réinitialiser le mot de passe
  const resetPassword = async (email: string) => {
    setError(null)
    return await authService.resetPassword(email)
  }

  return { 
    // État
    user, 
    loading,
    error,
    isTestUser,
    
    // Actions
    signUp,
    signIn,
    signInAsTestUser,
    signOut,
    uploadProfileImage,
    updateProfile,
    resetPassword,
    
    // Helpers
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
    isVolunteer: user?.role === 'volunteer',
    isTeamDirector: user?.role === 'team_director',
    
    // Informations système
    authType: isTestUser ? 'test' : 'supabase'
  }
}
