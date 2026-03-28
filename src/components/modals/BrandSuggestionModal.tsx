import React from 'react';
import { X, Check } from 'lucide-react';

interface BrandSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  brandData: {
    logo: string;
    colors: string[];
  } | null;
  clientName: string;
}

export function BrandSuggestionModal({ isOpen, onClose, onAccept, brandData, clientName }: BrandSuggestionModalProps) {
  if (!isOpen || !brandData) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <h2 className="text-xl font-headline font-semibold text-on-surface">Marca Encontrada</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-on-surface-variant text-center">
            Encontramos a identidade visual de <strong>{clientName}</strong>. Deseja aplicar?
          </p>

          <div className="flex flex-col items-center gap-4 p-6 bg-surface-variant/50 rounded-2xl">
            <img 
              src={brandData.logo} 
              alt={`Logo ${clientName}`} 
              className="w-24 h-24 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded-xl font-medium transition-colors"
            >
              Ignorar
            </button>
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Check className="w-4 h-4" />
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
