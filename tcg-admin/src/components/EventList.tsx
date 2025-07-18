import { useState } from 'react';
import { Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Activity } from '../types/database';

interface EventListProps {
  events: Activity[];
  onEventClick: (event: Activity) => void;
}

export default function EventList({ events, onEventClick }: EventListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 4;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = currentPage * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  // Determinar si un evento es hoy
  const isToday = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  // Determinar si un evento ya pasó
  const isPastEvent = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now;
  };

  return (
    <div className="space-y-4">
      {currentEvents.length > 0 ? (
        currentEvents.map(event => {
          const eventIsToday = isToday(event.fecha);
          const eventIsPast = isPastEvent(event.fecha);
          
          return (
            <div
              key={event.id_actividad}
              onClick={() => onEventClick(event)}
              className={`event-card ${eventIsPast ? 'past-event' : ''} cursor-pointer`}
            >
              {eventIsToday && !eventIsPast && (
                <div className="event-today-badge">
                  HOY
                </div>
              )}
              
              <h3 className="event-title">
                {event.nombre}
              </h3>
              
              <div className="event-detail">
                <Calendar className="event-detail-icon text-yellow-600" />
                <span className="event-detail-text">
                  {formatDate(event.fecha)}
                </span>
              </div>
              
              <div className="event-detail">
                <MapPin className="event-detail-icon text-red-600" />
                <span className="event-detail-text">
                  {event.ubicacion}
                </span>
              </div>
            </div>
          );
        })
      ) : (
         <p className="font-press-start text-xs text-gray-500">No hay próximas actividades.</p>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="retro-button pagination-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-press-start text-xs">
            Pág {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="retro-button pagination-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}