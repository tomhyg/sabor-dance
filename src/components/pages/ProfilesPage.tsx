import React, { useState } from 'react';
import { User, Star, Play, CheckCircle, Instagram, ExternalLink, X, Heart } from 'lucide-react';

interface Artist {
  id: string;
  user_id: string;
  stage_name: string;
  bio: string;
  specialties: string[];
  experience_years: number;
  profile_image: string;
  instagram?: string;
  website?: string;
  sample_videos: SampleVideo[];
  rating: number;
  total_reviews: number;
  location: string;
  available_for_booking: boolean;
  price_range?: string;
}

interface SampleVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  dance_style: string;
  duration: string;
}

interface Review {
  id: string;
  artist_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  event_name: string;
  date: string;
  verified: boolean;
}

interface ProfilesPageProps {
  t: any;
  currentUser: any;
}

const ProfilesPage: React.FC<ProfilesPageProps> = ({ t, currentUser }) => {
  const [artists] = useState<Artist[]>([
    {
      id: '1',
      user_id: '1',
      stage_name: 'María Rodríguez',
      bio: 'Danseuse et instructrice de salsa cubaine avec plus de 15 ans d\'expérience. Spécialisée dans la salsa casino et les ruedas. Fondatrice de l\'école Havana Nights Dance Academy à Madrid. Passionnée par la transmission de la culture cubaine à travers la danse, María organise régulièrement des stages intensifs et des voyages à Cuba pour ses élèves.',
      specialties: ['Salsa Cubaine', 'Rueda de Casino', 'Son Cubano'],
      experience_years: 15,
      profile_image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
      instagram: '@maria_salsa_madrid',
      website: 'www.havananights.es',
      sample_videos: [
        { id: '1', title: 'Salsa Casino Styling', url: '#', thumbnail: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=300', dance_style: 'Salsa', duration: '3:45' },
        { id: '2', title: 'Rueda de Casino Tutorial', url: '#', thumbnail: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=300', dance_style: 'Salsa', duration: '5:20' }
      ],
      rating: 4.9,
      total_reviews: 47,
      location: 'Madrid, Espagne',
      available_for_booking: true,
      price_range: '€80-120/heure'
    },
    {
      id: '2',
      user_id: '2',
      stage_name: 'Carlos "El Tigre" Santos',
      bio: 'Champion du monde de bachata sensuelle. Instructeur international reconnu pour son style unique et sa passion contagieuse. Créateur de plusieurs chorégraphies virales sur les réseaux sociaux. Carlos a remporté de nombreuses compétitions internationales et enseigne dans les plus grands festivals de danse latine.',
      specialties: ['Bachata Sensuelle', 'Bachata Dominicaine', 'Choreographie'],
      experience_years: 12,
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      instagram: '@eltigre_bachata',
      sample_videos: [
        { id: '3', title: 'Bachata Sensuelle Advanced', url: '#', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300', dance_style: 'Bachata', duration: '4:15' },
        { id: '4', title: 'Body Movement Technique', url: '#', thumbnail: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300', dance_style: 'Bachata', duration: '6:30' }
      ],
      rating: 4.8,
      total_reviews: 93,
      location: 'Santo Domingo, République Dominicaine',
      available_for_booking: true,
      price_range: '$100-150/hour'
    },
    {
      id: '3',
      user_id: '3',
      stage_name: 'Aminata Kizomba Queen',
      bio: 'Ambassadrice de la kizomba et de l\'urban kiz en Europe. Formatrice certifiée avec une approche moderne de la danse africaine traditionnelle. Organisatrice de festivals internationaux. Aminata a introduit la kizomba en France et continue de promouvoir cette danse magnifique à travers l\'Europe.',
      specialties: ['Kizomba', 'Urban Kiz', 'Semba', 'Tarraxa'],
      experience_years: 10,
      profile_image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      instagram: '@aminata_kizomba',
      website: 'www.kizombaqueen.com',
      sample_videos: [
        { id: '5', title: 'Kizomba Connection', url: '#', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300', dance_style: 'Kizomba', duration: '3:20' },
        { id: '6', title: 'Urban Kiz Fusion', url: '#', thumbnail: 'https://images.unsplash.com/photo-1583928901415-52b93e63aaef?w=300', dance_style: 'Urban Kiz', duration: '4:50' }
      ],
      rating: 4.9,
      total_reviews: 67,
      location: 'Paris, France',
      available_for_booking: true,
      price_range: '€90-130/heure'
    },
    {
      id: '4',
      user_id: '4',
      stage_name: 'Diego "Fuego" Martinez',
      bio: 'Maître de la salsa new-yorkaise et du mambo. Formé à New York auprès des plus grands, Diego apporte l\'authenticité du style portoricain avec une technique irréprochable. Il est reconnu pour sa capacité à enseigner les techniques les plus avancées tout en gardant l\'essence de la salsa.',
      specialties: ['Salsa New York', 'Mambo', 'Shine', 'Partnering'],
      experience_years: 18,
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      instagram: '@diego_fuego_salsa',
      website: 'www.fuegosalsa.com',
      sample_videos: [
        { id: '7', title: 'Salsa NY Advanced Patterns', url: '#', thumbnail: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=300', dance_style: 'Salsa', duration: '5:15' },
        { id: '8', title: 'Mambo Shines Masterclass', url: '#', thumbnail: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=300', dance_style: 'Salsa', duration: '4:30' }
      ],
      rating: 4.7,
      total_reviews: 89,
      location: 'New York, USA',
      available_for_booking: true,
      price_range: '$120-180/hour'
    },
    {
      id: '5',
      user_id: '5',
      stage_name: 'Isabella "Bella" Rodriguez',
      bio: 'Spécialiste du zouk brésilien et de la lambada. Isabella apporte la sensualité et la fluidité caractéristiques du zouk avec une technique parfaite. Elle enseigne dans le monde entier et est reconnue pour sa pédagogie exceptionnelle et sa capacité à transmettre l\'émotion à travers le mouvement.',
      specialties: ['Zouk Brésilien', 'Lambada', 'Soltinho', 'Styling Féminin'],
      experience_years: 13,
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616c95d131c?w=400',
      instagram: '@bella_zouk_oficial',
      website: 'www.bellazouk.com.br',
      sample_videos: [
        { id: '9', title: 'Zouk Flow & Connection', url: '#', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300', dance_style: 'Zouk', duration: '3:55' },
        { id: '10', title: 'Ladies Styling Zouk', url: '#', thumbnail: 'https://images.unsplash.com/photo-1583928901415-52b93e63aaef?w=300', dance_style: 'Zouk', duration: '4:20' }
      ],
      rating: 4.8,
      total_reviews: 72,
      location: 'Rio de Janeiro, Brésil',
      available_for_booking: true,
      price_range: '$90-140/hour'
    }
  ]);

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [expandedBio, setExpandedBio] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStyle, setFilterStyle] = useState('all');

  const reviews: Review[] = [
    {
      id: '1',
      artist_id: '1',
      reviewer_name: 'Sophie Laurent',
      rating: 5,
      comment: 'Cours exceptionnel ! María a une pédagogie formidable et transmet sa passion avec énergie. J\'ai appris plus en un weekend qu\'en plusieurs mois ailleurs.',
      event_name: 'Paris Salsa Festival',
      date: '2024-11-15',
      verified: true
    },
    {
      id: '2',
      artist_id: '2',
      reviewer_name: 'Jean Martinez',
      rating: 5,
      comment: 'Carlos est un vrai magicien de la bachata. Son style est unique et inspirant. Ses explications sont claires et il sait s\'adapter au niveau de chacun.',
      event_name: 'European Bachata Championship',
      date: '2024-10-20',
      verified: true
    },
    {
      id: '3',
      artist_id: '3',
      reviewer_name: 'Pierre Dubois',
      rating: 5,
      comment: 'Aminata m\'a fait découvrir la beauté de la kizomba. Sa technique est parfaite et elle transmet une émotion incroyable. Cours inoubliable !',
      event_name: 'Kizomba Paris Festival',
      date: '2024-09-12',
      verified: true
    },
    {
      id: '4',
      artist_id: '4',
      reviewer_name: 'Ana Gutierrez',
      rating: 5,
      comment: 'Diego est un maître incontesté de la salsa NY. Son enseignement est précis et passionné. Une expérience transformatrice !',
      event_name: 'New York Salsa Congress',
      date: '2024-08-18',
      verified: true
    },
    {
      id: '5',
      artist_id: '5',
      reviewer_name: 'Marc Silva',
      rating: 5,
      comment: 'Isabella incarne la beauté du zouk brésilien. Sa fluidité et sa sensibilité musicale sont extraordinaires. Merci pour cette masterclass !',
      event_name: 'Rio Zouk Festival',
      date: '2024-07-25',
      verified: true
    }
  ];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.stage_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStyle = filterStyle === 'all' || 
                        artist.specialties.some(s => s.toLowerCase().includes(filterStyle.toLowerCase()));
    
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-orange-900">
      {/* Hero Header */}
      <div className="relative py-20 bg-gradient-to-r from-pink-600 via-rose-600 to-orange-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              {t.profiles || 'Profils'} {t.artists || 'Artistes'}
            </h1>
            <p className="text-xl text-pink-100 max-w-2xl mx-auto mb-8">
              Découvrez les meilleurs instructeurs et artistes de danse latine
            </p>
            
            {/* Filtres et recherche */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <input
                type="text"
                placeholder={t.search || 'Rechercher...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/70 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full md:w-auto"
              />
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="all">Tous les styles</option>
                <option value="salsa">Salsa</option>
                <option value="bachata">Bachata</option>
                <option value="kizomba">Kizomba</option>
                <option value="zouk">Zouk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 backdrop-blur-md border border-pink-500/20 rounded-3xl p-6 text-center">
            <div className="text-3xl font-black text-pink-400 mb-2">{artists.length}</div>
            <p className="text-gray-300 font-medium">Artistes disponibles</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-md border border-orange-500/20 rounded-3xl p-6 text-center">
            <div className="text-3xl font-black text-orange-400 mb-2">{artists.filter(a => a.available_for_booking).length}</div>
            <p className="text-gray-300 font-medium">Disponibles booking</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-3xl p-6 text-center">
            <div className="text-3xl font-black text-yellow-400 mb-2">{Math.round(artists.reduce((acc, a) => acc + a.rating, 0) / artists.length * 10) / 10}</div>
            <p className="text-gray-300 font-medium">Note moyenne</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6 text-center">
            <div className="text-3xl font-black text-purple-400 mb-2">{Math.round(artists.reduce((acc, a) => acc + a.experience_years, 0) / artists.length)}</div>
            <p className="text-gray-300 font-medium">Années d\'exp. moyenne</p>
          </div>
        </div>

        {/* Grille des artistes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArtists.map(artist => (
            <div key={artist.id} className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl overflow-hidden hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10">
              {/* Image de profil */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={artist.profile_image} 
                  alt={artist.stage_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {artist.available_for_booking && (
                    <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {t.availableBooking || 'Disponible'}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{artist.stage_name}</h3>
                  <p className="text-pink-200 text-sm">{t.basedIn || 'Basé à'} {artist.location}</p>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                {/* Rating et expérience */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < Math.floor(artist.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} 
                        />
                      ))}
                    </div>
                    <span className="text-white font-bold">{artist.rating}</span>
                    <span className="text-gray-400 text-sm">({artist.total_reviews})</span>
                  </div>
                  <span className="text-pink-400 text-sm font-semibold">
                    {artist.experience_years} {t.yearsExp || 'ans'}
                  </span>
                </div>

                {/* Spécialités */}
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">{t.specialties || 'Spécialités'}:</p>
                  <div className="flex flex-wrap gap-2">
                    {artist.specialties.slice(0, 3).map(specialty => (
                      <span key={specialty} className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded-lg text-xs border border-pink-500/30">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio courte */}
                <div className="mb-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {expandedBio === artist.id 
                      ? artist.bio 
                      : `${artist.bio.substring(0, 120)}...`
                    }
                    <button
                      onClick={() => setExpandedBio(expandedBio === artist.id ? null : artist.id)}
                      className="text-pink-400 hover:text-pink-300 ml-2 font-semibold text-xs"
                    >
                      {expandedBio === artist.id ? (t.readLess || 'Lire moins') : (t.readMore || 'Lire plus')}
                    </button>
                  </p>
                </div>

                {/* Prix et actions */}
                <div className="flex items-center justify-between">
                  <div>
                    {artist.price_range && (
                      <p className="text-white font-bold text-sm">{artist.price_range}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedArtist(artist)}
                    className="bg-gradient-to-r from-pink-500 to-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:from-pink-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {t.viewProfile || 'Voir profil'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">Aucun artiste trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Modal de profil détaillé */}
        {selectedArtist && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="relative p-8 pb-0">
                <button 
                  onClick={() => setSelectedArtist(null)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200"
                >
                  <X size={24} />
                </button>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Image de profil */}
                  <div className="flex-shrink-0">
                    <img 
                      src={selectedArtist.profile_image} 
                      alt={selectedArtist.stage_name}
                      className="w-48 h-48 object-cover rounded-2xl"
                    />
                  </div>
                  
                  {/* Informations principales */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-4xl font-black text-white">{selectedArtist.stage_name}</h2>
                      <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-bold border border-green-500/30">
                        {t.verified || 'Vérifié'}
                      </span>
                    </div>
                    
                    <p className="text-pink-300 text-lg mb-4">{selectedArtist.location}</p>
                    
                    {/* Rating et stats */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={20} 
                              className={i < Math.floor(selectedArtist.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} 
                            />
                          ))}
                        </div>
                        <span className="text-white font-bold text-lg">{selectedArtist.rating}</span>
                        <span className="text-gray-400">({selectedArtist.total_reviews} {t.reviews || 'avis'})</span>
                      </div>
                      <div className="text-pink-400 font-semibold">
                        {selectedArtist.experience_years} {t.yearsExp || 'ans d\'expérience'}
                      </div>
                    </div>
                    
                    {/* Spécialités */}
                    <div className="mb-6">
                      <h4 className="text-white font-bold mb-3">{t.specialties || 'Spécialités'}</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedArtist.specialties.map(specialty => (
                          <span key={specialty} className="px-3 py-2 bg-pink-500/20 text-pink-300 rounded-xl text-sm border border-pink-500/30 font-medium">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Prix et disponibilité */}
                    <div className="flex items-center gap-6">
                      {selectedArtist.price_range && (
                        <div>
                          <span className="text-gray-400 text-sm">{t.priceRange || 'Tarifs'}:</span>
                          <p className="text-white font-bold text-lg">{selectedArtist.price_range}</p>
                        </div>
                      )}
                      {selectedArtist.available_for_booking && (
                        <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-xl text-sm font-bold border border-green-500/30">
                          {t.availableBooking || 'Disponible pour booking'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="p-8">
                {/* Bio */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">À propos</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{selectedArtist.bio}</p>
                </div>

                {/* Vidéos échantillons */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-6">{t.sampleVideos || 'Vidéos échantillons'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedArtist.sample_videos.map(video => (
                      <div key={video.id} className="group bg-gray-700/30 rounded-2xl overflow-hidden border border-gray-600/30 hover:border-pink-500/50 transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="bg-white/20 backdrop-blur-md rounded-full p-4 hover:bg-white/30 transition-all duration-200">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-white font-bold mb-1">{video.title}</h4>
                          <p className="text-pink-400 text-sm">{video.dance_style}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avis */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-6">{t.reviews || 'Avis'}</h3>
                  <div className="space-y-6">
                    {reviews
                      .filter(review => review.artist_id === selectedArtist.id)
                      .map(review => (
                        <div key={review.id} className="bg-gray-700/30 border border-gray-600/30 rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                                <User size={20} className="text-white" />
                              </div>
                              <div>
                                <p className="text-white font-semibold">{review.reviewer_name}</p>
                                <p className="text-gray-400 text-sm">{review.event_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={16} 
                                    className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} 
                                  />
                                ))}
                              </div>
                              {review.verified && (
                                <CheckCircle size={16} className="text-green-400" />
                              )}
                            </div>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                          <p className="text-gray-500 text-sm mt-3">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-gradient-to-r from-pink-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    {t.contactArtist || 'Contacter l\'artiste'}
                  </button>
                  
                  <div className="flex gap-4">
                    {selectedArtist.instagram && (
                      <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2">
                        <Instagram size={20} />
                        {t.instagram || 'Instagram'}
                      </button>
                    )}
                    {selectedArtist.website && (
                      <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2">
                        <ExternalLink size={20} />
                        {t.website || 'Site web'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilesPage;