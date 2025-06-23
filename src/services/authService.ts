// src/services/authService.ts - Version hybride (test + vraie auth)
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

// Liste des utilisateurs test (gardent l'ancien système)
const TEST_USERS = [
  'hernan@bostonsalsafest.com',
  'kelly@bostonsalsafest.com', 
  'andres@bostonsalsafest.com',
  'volunteer1@test.com',
  'volunteer2@test.com',
  'volunteer3@test.com',
  'volunteer4@test.com',
  'volunteer5@test.com',
  'teamdir1@test.com',
  'teamdir2@test.com',
  'teamdir3@test.com',
  'teamdir4@test.com',
  'teamdir5@test.com',
  'teamdir6@test.com',
  'teamdir7@test.com',
  'tom.huyghe@orange.fr'
];

export const authService = {
  // Vérifier si c'est un utilisateur test
  isTestUser(email: string): boolean {
    return TEST_USERS.includes(email.toLowerCase().trim());
  },

  // Inscription complète (nouveaux utilisateurs seulement)
  async signUp(email: string, password: string, userData: {
    full_name: string
    role: 'volunteer' | 'team_director' | 'organizer' | 'admin' | 'assistant' | 'artist' | 'attendee'
    phone?: string
    bio?: string
    location?: string
    instagram?: string
    website_url?: string
    experience_years?: number
    specialties?: string[]
  }) {
    try {
      const cleanEmail = email.toLowerCase().trim();

      // Vérifier que ce n'est pas un email test
      if (this.isTestUser(cleanEmail)) {
        return { 
          data: null, 
          error: { message: 'Cet email est réservé aux comptes test. Utilisez un autre email.' } 
        };
      }

      // Vérifier si l'email existe déjà
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        return { 
          data: null, 
          error: { message: 'Un compte existe déjà avec cet email.' } 
        };
      }

      // 1. Créer l'utilisateur dans auth.users avec confirmation email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('Erreur création auth:', authError);
        return { data: null, error: authError };
      }

      if (!authData.user) {
        return { data: null, error: { message: 'Erreur lors de la création du compte' } };
      }

      // 2. Créer le profil dans public.users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: cleanEmail,
          full_name: userData.full_name.trim(),
          role: userData.role,
          phone: userData.phone?.trim() || null,
          bio: userData.bio?.trim() || null,
          location: userData.location?.trim() || null,
          instagram: userData.instagram?.trim() || null,
          website_url: userData.website_url?.trim() || null,
          experience_years: userData.experience_years || null,
          specialties: userData.specialties || null,
          verified: false, // Sera true après confirmation email
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        
        // Si c'est une erreur de permissions, essayer sans les timestamps
        if (profileError.code === '42501' || profileError.message.includes('permission')) {
          const { error: retryError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: cleanEmail,
              full_name: userData.full_name.trim(),
              role: userData.role,
              phone: userData.phone?.trim() || null,
              verified: false
            });
            
          if (retryError) {
            console.error('Erreur retry création profil:', retryError);
            return { data: null, error: { message: 'Erreur lors de la création du profil' } };
          }
        } else {
          return { data: null, error: { message: 'Erreur lors de la création du profil' } };
        }
      }

      return { 
        data: authData, 
        error: null,
        message: 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.'
      };

    } catch (error) {
      console.error('Erreur signUp:', error);
      return { 
        data: null, 
        error: { message: 'Erreur inattendue lors de l\'inscription' } 
      };
    }
  },

  // Connexion hybride (test ou vraie auth)
  async signIn(email: string, password: string) {
    try {
      const cleanEmail = email.toLowerCase().trim();

      // Si c'est un utilisateur test, utiliser l'ancien système
      if (this.isTestUser(cleanEmail)) {
        return this.signInAsTestUser(cleanEmail);
      }

      // Sinon, utiliser la vraie authentification
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: cleanEmail, 
        password 
      });

      if (error) {
        let userMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Veuillez confirmer votre email avant de vous connecter';
        }
        return { data: null, error: { message: userMessage } };
      }

      return { data, error: null };

    } catch (error) {
      console.error('Erreur signIn:', error);
      return { 
        data: null, 
        error: { message: 'Erreur lors de la connexion' } 
      };
    }
  },

  // Connexion test (ancien système, gardé pour compatibilité)
  async signInAsTestUser(email: string) {
    try {
      const cleanEmail = email.toLowerCase().trim();
      
      console.log('🧪 Connexion utilisateur test:', cleanEmail);

      const { data, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (queryError) {
        console.error('Erreur requête test:', queryError);
        return { data: null, error: { message: `Erreur requête: ${queryError.message}` } };
      }

      if (data) {
        console.log('✅ Utilisateur test trouvé:', data.full_name);
        
        // Créer une session factice compatible
        const fakeSession = {
          user: data,
          access_token: 'test-token-' + Date.now(),
          refresh_token: 'test-refresh-' + Date.now()
        };

        return { data: fakeSession, error: null };
      } else {
        return { 
          data: null, 
          error: { message: 'Utilisateur de test non trouvé' } 
        };
      }
      
    } catch (error) {
      console.error('Erreur signInAsTestUser:', error);
      return { 
        data: null, 
        error: { message: 'Erreur connexion test' } 
      };
    }
  },

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Erreur signOut:', error);
      return { error: { message: 'Erreur lors de la déconnexion' } };
    }
  },

  // Récupérer l'utilisateur actuel (hybride)
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Récupérer le profil complet
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erreur récupération profil:', error);
        return null;
      }

      return profile;

    } catch (error) {
      console.error('Erreur getCurrentUser:', error);
      return null;
    }
  },

  // Upload de photo de profil
  async uploadProfileImage(userId: string, file: File) {
    try {
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        return { data: null, error: { message: 'Le fichier doit être une image' } };
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB max
        return { data: null, error: { message: 'L\'image doit faire moins de 5MB' } };
      }

      // Générer un nom unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        return { data: null, error: { message: 'Erreur lors de l\'upload de l\'image' } };
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        return { data: null, error: { message: 'Erreur lors de la génération de l\'URL' } };
      }

      // Mettre à jour le profil avec l'URL de l'image
      const { data: updateData, error: updateError } = await this.updateProfile(userId, {
        profile_image: urlData.publicUrl
      });

      if (updateError) {
        return { data: null, error: updateError };
      }

      return { data: { url: urlData.publicUrl }, error: null };

    } catch (error) {
      console.error('Erreur uploadProfileImage:', error);
      return { data: null, error: { message: 'Erreur inattendue lors de l\'upload' } };
    }
  },

  // Mettre à jour le profil
  async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };

    } catch (error) {
      console.error('Erreur updateProfile:', error);
      return { data: null, error: { message: 'Erreur lors de la mise à jour' } };
    }
  },

  // Réinitialiser le mot de passe (nouveaux utilisateurs uniquement)
  async resetPassword(email: string) {
    try {
      const cleanEmail = email.toLowerCase().trim();

      if (this.isTestUser(cleanEmail)) {
        return { 
          error: { message: 'Les comptes test ne peuvent pas réinitialiser leur mot de passe.' } 
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);

      if (error) {
        return { error: { message: 'Erreur lors de l\'envoi de l\'email' } };
      }

      return { 
        error: null, 
        message: 'Email de réinitialisation envoyé !' 
      };

    } catch (error) {
      console.error('Erreur resetPassword:', error);
      return { error: { message: 'Erreur lors de la réinitialisation' } };
    }
  },

  // Vérifier si un email existe déjà
  async checkEmailExists(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      return { exists: !!data, error };

    } catch (error) {
      console.error('Erreur checkEmailExists:', error);
      return { exists: false, error };
    }
  }
};