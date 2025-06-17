// src/services/authService.ts
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

export const authService = {
  // Inscription
  async signUp(email: string, password: string, userData: {
    full_name: string
    role: string
    phone?: string
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role
        }
      }
    })
    
    if (!error && data.user) {
      // Créer le profil utilisateur dans notre table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          full_name: userData.full_name,
          role: userData.role,
          phone: userData.phone || null,
          verified: false
        })
      
      if (profileError) {
        console.error('Erreur création profil:', profileError)
      }
    }
    
    return { data, error }
  },

  // Connexion
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  // Déconnexion
  async signOut() {
    return await supabase.auth.signOut()
  },

  // Récupérer l'utilisateur actuel avec son profil
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return profile
  },

  // Connexion avec les utilisateurs de test (sans mot de passe)
  async signInAsTestUser(email: string) {
    // Pour les tests - créer une session factice
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    return { user, error: null }
  },

  // Mettre à jour le profil
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  }
}