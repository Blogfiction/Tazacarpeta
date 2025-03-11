import { Calendar, MapPin } from 'lucide-react';

interface Event {
  id_actividad: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
}

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export default function EventList({ events, onEventClick }: EventListProps) {
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
      {events.map(event => {
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
      })}
    </div>
  );
}