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
    return new Intl.DateTimeFormat('es', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {events.map(event => (
        <div
          key={event.id_actividad}
          onClick={() => onEventClick(event)}
          className="retro-container bg-white hover:translate-x-1 hover:translate-y-1 transition-transform cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-press-start text-sm text-gray-800">{event.nombre}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-xs">{formatDate(event.fecha)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-xs">{event.ubicacion}</span>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <span className="inline-flex items-center px-2.5 py-0.5 font-press-start text-[10px] bg-gray-800 text-yellow-200">
                Próximo
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}