import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

export interface LightboxImage {
  id: string;
  url: string;
  nome: string;
  ambienteNome?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Navegação por teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Desativar scroll do body ao abrir
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Gestos touch para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F0C0A]/95 backdrop-blur-xl flex flex-col justify-between animate-fadeIn select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 pt-safe text-[#FAF8F5] border-b border-[#2A1F19] bg-[#140E0B]/80 z-20">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#C5A265] uppercase tracking-wider">
              {currentImg.ambienteNome || 'Ambiente do Projeto'}
            </span>
            <span className="text-xs text-[#8C7D73]">•</span>
            <span className="text-xs text-[#FAF8F5] font-medium truncate max-w-xs">
              {currentImg.nome}
            </span>
          </div>
          <p className="text-[11px] text-[#8C7D73] font-mono mt-0.5">
            Render {currentIndex + 1} de {images.length}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 text-[#D9D2C7] hover:text-[#C5A265] hover:bg-[#2A1F19] rounded-xl transition-colors"
            title={isZoomed ? 'Reduzir Zoom' : 'Ampliar Imagem'}
          >
            {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#D9D2C7] hover:text-white hover:bg-[#2A1F19] rounded-xl transition-colors active:scale-95"
            title="Fechar Visualização (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 relative flex items-center justify-center p-3 sm:p-6 overflow-hidden cursor-pointer"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {/* Setas de Navegação */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 z-20 p-3 rounded-full bg-[#1B1410]/80 hover:bg-[#C5A265] text-[#FAF8F5] hover:text-[#1B1410] border border-[#382B23] transition-all shadow-xl active:scale-90"
              title="Imagem Anterior (Seta Esquerda)"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 z-20 p-3 rounded-full bg-[#1B1410]/80 hover:bg-[#C5A265] text-[#FAF8F5] hover:text-[#1B1410] border border-[#382B23] transition-all shadow-xl active:scale-90"
              title="Próxima Imagem (Seta Direita)"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Imagem Central */}
        <div
          className={`relative max-w-5xl max-h-full flex items-center justify-center transition-transform duration-300 ${
            isZoomed ? 'scale-125 sm:scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
        >
          <img
            src={currentImg.url}
            alt={currentImg.nome}
            className="max-h-[72dvh] sm:max-h-[78dvh] max-w-full w-auto object-contain rounded-xl shadow-2xl border border-[#2A1F19]"
          />
        </div>
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div className="bg-[#140E0B]/80 border-t border-[#2A1F19] p-3 pb-safe z-20 overflow-x-auto no-scrollbar flex items-center justify-center space-x-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setIsZoomed(false);
                setCurrentIndex(idx);
              }}
              className={`h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                idx === currentIndex
                  ? 'border-[#C5A265] scale-105 shadow-md'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={img.nome} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
