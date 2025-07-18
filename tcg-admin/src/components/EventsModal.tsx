import { useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, MapPin, Link as LinkIcon, Store, TowerControl as GameController } from 'lucide-react';
import { Activity, Game, Store as StoreType } from '../types/database';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: Activity[];
  games: Game[];
  stores: StoreType[];
  onEventClick: (event: Activity) => void;
}

export default function EventsModal({ 
  isOpen, 
  onClose, 
  date, 
  events,
  games,
  stores,
  onEventClick 
}: EventsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(isOpen);
  useFocusTrap(contentRef, isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dateEvents = events.filter(event => {
    const eventDate = new Date(event.fecha);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity z-[var(--z-modal-backdrop)]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="fixed inset-0 overflow-y-auto z-[var(--z-modal)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            ref={contentRef}
            className="w-full max-w-2xl bg-white retro-container transform transition-all my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="flex items-center justify-between">
                <h2 
                  id="modal-title"
                  className="font-press-start text-sm text-yellow-200"
                >
                  {date.toLocaleDateString('es', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-300 hover:text-yellow-200 transition-colors p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="modal-body">
              {dateEvents.length > 0 ? (
                <div className="space-y-4">
                  {dateEvents.map(event => {
                    const game = games.find(g => g.id_juego === event.id_juego);
                    const store = stores.find(s => s.id_tienda === event.id_tienda);

                    return (
                      <div
                        key={event.id_actividad}
                        className="retro-container bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => onEventClick(event)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-press-start text-sm text-gray-800">
                              {event.nombre}
                            </h3>
                            <span className="font-press-start text-xs text-gray-600">
                              {formatTime(event.fecha)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{event.ubicacion}</span>
                            </div>

                            {store && (
                              <div className="flex items-center text-gray-600">
                                <Store className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{store.nombre}</span>
                              </div>
                            )}

                            {game && (
                              <div className="flex items-center text-gray-600">
                                <GameController className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{game.nombre}</span>
                              </div>
                            )}

                            {event.enlace_referencia && (
                              <div className="flex items-center text-blue-600">
                                <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                <a
                                  href={event.enlace_referencia}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="truncate hover:underline"
                                >
                                  Enlace
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="font-press-start text-sm text-gray-500">
                    No hay eventos para este día
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}