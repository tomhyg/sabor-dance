import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Play, Heart, Users, Music, User } from 'lucide-react';

interface HomePageProps {
  t: any; // Type pour les traductions
  setCurrentView: (view: string) => void;
  setShowAuth: (show: boolean) => void;
}

const HomePage: React.FC<HomePageProps> = ({ t, setCurrentView, setShowAuth }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section with DORA-style gradients */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-pink-800"></div>
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-pink-500/30 to-violet-500/30 rounded-full blur-3xl animate-pulse"
            style={{
              left: mousePosition.x * 0.01 + 'px',
              top: mousePosition.y * 0.01 + 'px',
              transform: 'translate(-50%, -50%)'
            }}
          ></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white/20 rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium mb-8 animate-fade-in">
              <Star className="w-4 h-4" />
              Révolutionnez vos congrès de danse
              <Star className="w-4 h-4" />
            </div>
          </div>

          {/* Main Title - DORA Style */}
          <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-violet-200 mb-8 leading-none tracking-tighter animate-slide-up">
            Sabor
          </h1>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-purple-400 mb-12 leading-none tracking-tighter animate-slide-up delay-200">
            Dance
          </h2>

          {/* Subtitle with animation */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-medium max-w-4xl mx-auto leading-relaxed mb-16 animate-fade-in delay-400">
            La plateforme qui digitalise l'expérience des congrès de danse latine
            <br />
            <span className="text-pink-300">Salsa • Bachata • Kizomba • Zouk</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in delay-600">
            <button 
              onClick={() => setShowAuth(true)}
              className="group relative px-12 py-6 bg-gradient-to-r from-pink-500 to-violet-600 text-white text-xl font-bold rounded-2xl hover:from-pink-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25"
            >
              <span className="relative z-10 flex items-center gap-3">
                {t.startFree}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-violet-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button className="group flex items-center gap-3 px-8 py-6 text-white/90 text-xl font-semibold hover:text-white transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                <Play className="w-8 h-8 ml-1" />
              </div>
              Voir la démo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section with DORA-style cards */}
      <div className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-6">
              Fonctionnalités
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Des outils puissants pour organiser des événements inoubliables
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Volunteer Management Card */}
            <div 
              onClick={() => setCurrentView('volunteers')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 p-8 hover:scale-105 transition-all duration-500 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-teal-600/20 group-hover:from-green-300/30 group-hover:to-teal-500/30 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-4 group-hover:text-green-100 transition-colors">
                  {t.volunteerManagement}
                </h3>
                <p className="text-white/90 text-lg leading-relaxed mb-8">
                  {t.volunteerDesc}
                </p>
                
                <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
                  <span className="font-semibold">{t.discover}</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 bg-emerald-300/20 rounded-full blur-lg group-hover:scale-150 transition-all duration-700"></div>
            </div>

            {/* Performance Teams Card */}
            <div 
              onClick={() => setCurrentView('teams')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 p-8 hover:scale-105 transition-all duration-500 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 group-hover:from-purple-300/30 group-hover:to-indigo-500/30 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <Music className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-4 group-hover:text-purple-100 transition-colors">
                  {t.teamPerformance}
                </h3>
                <p className="text-white/90 text-lg leading-relaxed mb-8">
                  {t.teamDesc}
                </p>
                
                <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
                  <span className="font-semibold">{t.discover}</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-lg group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-violet-300/20 rounded-full blur-xl group-hover:scale-125 transition-all duration-700"></div>
            </div>

            {/* Profiles Card */}
            <div 
              onClick={() => setCurrentView('profiles')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-pink-600 to-red-700 p-8 hover:scale-105 transition-all duration-500 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-600/20 group-hover:from-orange-300/30 group-hover:to-red-500/30 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-4 group-hover:text-orange-100 transition-colors">
                  {t.profiles}
                </h3>
                <p className="text-white/90 text-lg leading-relaxed mb-8">
                  Découvrez les profils des artistes et instructeurs de danse latine
                </p>
                
                <div className="flex items-center text-white/80 group-hover:text-white transition-colors">
                  <span className="font-semibold">{t.discover}</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="absolute top-8 right-8 w-14 h-14 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="absolute bottom-6 left-6 w-18 h-18 bg-pink-300/20 rounded-full blur-lg group-hover:scale-110 transition-all duration-700"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="relative py-32 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-3xl animate-bounce"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-violet-200 mb-8 leading-tight">
              {t.readyTitle}
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              {t.readyDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={() => setShowAuth(true)}
                className="group px-12 py-6 bg-gradient-to-r from-pink-500 to-violet-600 text-white text-xl font-bold rounded-2xl hover:from-pink-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25"
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  {t.startFree}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button className="px-8 py-6 border-2 border-white/20 text-white text-xl font-semibold rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all duration-300">
                Demander une démo
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;