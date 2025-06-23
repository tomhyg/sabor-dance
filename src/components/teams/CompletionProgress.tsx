// src/components/teams/CompletionProgress.tsx
import React from 'react';
import { CheckCircle, Circle, Target, Star } from 'lucide-react';
import { PerformanceTeam } from '../../types/PerformanceTeam';
import { useTeamValidation } from '../../hooks/useTeamValidation';

interface CompletionProgressProps {
  team: PerformanceTeam;
  currentUser: any;
  translate: (key: string) => string;
  onMarkCompleted?: (teamId: string) => void;
  showMarkCompleted?: boolean;
}

export const CompletionProgress: React.FC<CompletionProgressProps> = ({
  team,
  currentUser,
  translate,
  onMarkCompleted,
  showMarkCompleted = false
}) => {
  const { getCompletionStatus } = useTeamValidation({ currentUser, translate });
  const completion = getCompletionStatus(team);
  
  const progressPercentage = (completion.completed / completion.total) * 100;
  const requiredCompleted = completion.checks.filter(c => c.required && c.completed).length;
  const requiredTotal = completion.checks.filter(c => c.required).length;

  return (
    <div className="space-y-4">
      
      {/* Barre de progression globale */}
      <div className="space-y-2">
        {/* En-tête avec titre et compteur */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">
            {translate('overallProgress')}
          </span>
          <span className="text-sm font-bold text-purple-300">
            {completion.completed}/{completion.total}
          </span>
        </div>
        
        {/* Barre de progression */}
        <div className="bg-gray-600/50 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-violet-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Pourcentage centré */}
        <div className="flex items-center justify-center">
          <span className="text-xs text-gray-400">
            {Math.round(progressPercentage)}% {translate('completed')}
          </span>
        </div>
      </div>

      {/* Barre de progression des champs obligatoires */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">
              {translate('requiredFields')}
            </span>
          </div>
          <span className="text-sm font-bold text-orange-300">
            {requiredCompleted}/{requiredTotal}
          </span>
        </div>
        
        <div className="bg-gray-600/50 rounded-full h-2 overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
            style={{ width: `${(requiredCompleted / requiredTotal) * 100}%` }}
          />
        </div>

        {/* Liste des champs obligatoires */}
        <div className="grid grid-cols-1 gap-2">
          {completion.checks.filter(check => check.required).map((check, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {check.completed ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
              <span className={`${check.completed ? 'text-green-300' : 'text-gray-400'}`}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Champs optionnels */}
      {completion.checks.filter(c => !c.required).length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              {translate('optionalFields')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {completion.checks.filter(check => !check.required).map((check, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {check.completed ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
                <span className={`${check.completed ? 'text-green-300' : 'text-gray-400'}`}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton "Marquer comme complété" */}
      {showMarkCompleted && completion.isComplete && team.status === 'draft' && onMarkCompleted && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <div className="mb-3">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-300 font-semibold">
              {translate('readyToComplete')}
            </p>
            <p className="text-gray-400 text-sm">
              {translate('allRequiredFieldsCompleted')}
            </p>
          </div>
          
          <button
            onClick={() => onMarkCompleted(team.id)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {translate('markAsCompleted')}
            </div>
          </button>
        </div>
      )}

      {/* Message si des champs sont manquants */}
      {!completion.isComplete && completion.missing.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-300 font-semibold mb-2">
            {translate('missingRequiredFields')}:
          </p>
          <ul className="text-red-300 text-sm space-y-1">
            {completion.missing.map((field, index) => (
              <li key={index} className="flex items-center gap-2">
                <Circle className="w-3 h-3" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};