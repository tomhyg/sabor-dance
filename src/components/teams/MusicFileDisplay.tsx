// src/components/teams/MusicFileDisplay.tsx - AFFICHAGE CORRECT DU NOM DE FICHIER
import React from 'react';
import { Music, CheckCircle, Download, Play, X } from 'lucide-react';
import { PerformanceTeam } from '../../types/PerformanceTeam';

interface MusicFileDisplayProps {
  team: PerformanceTeam;
  translate: (key: string) => string;
  canEdit?: boolean;
  onRemove?: () => void;
  onPlay?: () => void;
  showDetails?: boolean;
}

export const MusicFileDisplay: React.FC<MusicFileDisplayProps> = ({ 
  team, 
  translate, 
  canEdit = false,
  onRemove,
  onPlay,
  showDetails = true
}) => {
  
  if (!team.music_file_url) {
    return (
      <div className="flex items-center gap-3 bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
        <Music className="w-5 h-5 text-gray-400" />
        <span className="text-gray-400">{translate('noMusicFile')}</span>
      </div>
    );
  }

  // Priorité d'affichage: music_file_name > song_title > "Fichier musical"
  const displayName = team.music_file_name || team.song_title || translate('musicFile');
  const isRenamed = !!team.music_file_name;

  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-green-400" />
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-medium truncate">
              {displayName}
            </span>
            
            {isRenamed && (
              <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-md text-xs text-blue-400">
                {translate('autoRenamed')}
              </span>
            )}
          </div>
          
          {showDetails && (
            <div className="mt-1 space-y-1">
              {team.song_title && team.music_file_name && team.song_title !== team.music_file_name && (
                <p className="text-gray-400 text-xs">
                  <strong>{translate('originalTitle')}:</strong> {team.song_title}
                </p>
              )}
              
              {team.music_file_name && (
                <p className="text-gray-400 text-xs">
                  <strong>{translate('storedAs')}:</strong> {team.music_file_name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onPlay && (
            <button
              onClick={onPlay}
              className="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors"
              title={translate('playMusic')}
            >
              <Play className="w-4 h-4 text-green-400" />
            </button>
          )}
          
          <a
            href={team.music_file_url}
            download={team.music_file_name || 'music'}
            className="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors"
            title={translate('downloadMusic')}
          >
            <Download className="w-4 h-4 text-green-400" />
          </a>
          
          {canEdit && onRemove && (
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
              title={translate('removeMusic')}
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
