import React from 'react';
import { CharacterData } from '../types';
import { Star } from 'lucide-react';

interface Props { character: CharacterData; isUnlocked: boolean; isSelected: boolean; onClick: () => void; }

export const CharacterCard: React.FC<Props> = React.memo(({ character, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isSelected}
    aria-label={character.name}
    className={`relative aspect-[3/4] w-full rounded-lg border-2 overflow-hidden group text-left transition-[transform,border-color,box-shadow] duration-200 bg-gradient-to-b from-slate-800/60 to-slate-950/80
      ${isSelected ? 'border-yellow-400 scale-[1.04] shadow-[0_0_20px_rgba(250,204,21,0.5)] z-10' : 'border-slate-600 hover:border-slate-400 active:scale-95'}`}
  >
    <div className="absolute inset-0 p-1.5 pb-8 flex items-end justify-center">
      <img src={character.portraitSrc} alt="" draggable={false} decoding="async" className="w-full h-full object-contain object-bottom drop-shadow-lg group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent px-1.5 pb-1.5 pt-5 z-10">
      <div className="flex justify-center mb-0.5">
        {Array.from({ length: character.rarity }).map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
      </div>
      <p className="text-white text-[clamp(.55rem,1.8vmin,.8rem)] font-bold text-center truncate">{character.name}</p>
    </div>
  </button>
));
