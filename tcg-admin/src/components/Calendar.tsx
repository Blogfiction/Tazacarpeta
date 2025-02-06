import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  events: Array<{
    id_actividad: string;
    fecha: string;
    nombre: string;
    ubicacion: string;
  }>;
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ events, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasEventOnDate = (date: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.fecha);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-24" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const hasEvent = hasEventOnDate(date);

      days.push(
        <div
          key={day}
          onClick={() => onDateSelect(date)}
          className={`h-16 sm:h-24 border border-gray-200 p-2 cursor-pointer transition-colors ${
            hasEvent ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
          }`}
        >
          <span className={`text-xs sm:text-sm font-medium ${
            hasEvent ? 'text-blue-600' : 'text-gray-700'
          }`}>
            {day}
          </span>
          {hasEvent && (
            <div className="mt-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="retro-container bg-white pixel-corners -mx-4 sm:mx-0">
      <div className="p-2 sm:p-4 flex items-center justify-between border-b-4 border-gray-800">
        <h2 className="font-press-start text-xs sm:text-sm text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="retro-button p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="retro-button p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="p-2 text-center font-press-start text-[10px] sm:text-xs text-gray-800 border-b-4 border-gray-800">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  );
}