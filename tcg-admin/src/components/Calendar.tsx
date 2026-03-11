import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EventsModal from './EventsModal';
import type { Activity, Game, Store } from '../types/database';

interface CalendarProps {
  events: Activity[];
  games: Game[];
  stores: Store[];
  onEventClick: (event: Activity) => void;
}

export default function Calendar({ events, games, stores, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasEventOnDate = (date: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.date);
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
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
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-16 sm:h-24 bg-white shadow-sm hover: shadow-md transition-shadow border border-gray-200 p-2 cursor-pointer flex flex-col justify-between rounded-sm ${
            hasEvent ? 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-50'}
          } ${isToday ? 'border-2 border-yellow-500 bg-yellow-50' : ''}`}
        >
          <span className={`text-xs sm:text-sm font-semibold ${
            hasEvent ? 'text-blue-700' : 'text-gray-800'
          }`}>
            {day}
          </span>
          {hasEvent && (
            <div className="mt-1">
              <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm self-end"></div>
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
    <>
      <div className="retro-container bg-white pixel-corners -mx-4 sm:mx-0">
        <div className="p-4 flex items-center justify-between border-b-4 border-gray-800 bg-gray-100">
          <h2 className="font-press-start text-sm sm:text-base text-gray-900 tracking-wide">
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
        <div className="grid grid-cols-7 gap-2 bg-gray-300 p-2 rounded-md">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center font-press-start text-xs text-gray-700 bg-gray-200 border-b-4 border-gray-800 uppercase tracking-wider">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      </div>

      {selectedDate && (
        <EventsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          events={events}
          games={games}
          stores={stores}
          onEventClick={onEventClick}
        />
      )}
    </>
  );
}