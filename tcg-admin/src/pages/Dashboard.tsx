import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import EventList from '../components/EventList';
import { getActivities } from '../services/activities';
import type { Activity } from '../types/database';

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadActivities();
  }, [session, navigate]);

  async function loadActivities() {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (err) {
      setError('Error al cargar las actividades');
    } finally {
      setLoading(false);
    }
  }

  const handleNewEvent = () => {
    navigate('/activities');
  };

  const handleEventClick = (event: Activity) => {
    navigate(`/activities/${event.id_actividad}`);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end h-16 items-center">
            <button
              onClick={handleNewEvent}
              className="retro-button inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-press-start text-xs sm:text-sm">Nueva Actividad</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="retro-container mb-4 bg-red-100">
            <p className="font-press-start text-xs text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-gray-800" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Events Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="retro-container bg-white">
                <h2 className="font-press-start text-sm sm:text-base text-gray-800 mb-4">
                  Próximas Actividades
                </h2>
                <EventList
                  events={activities.filter(activity => new Date(activity.fecha) >= new Date())}
                  onEventClick={handleEventClick}
                />
              </div>
            </div>

            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Calendar
                events={activities}
                onDateSelect={setSelectedDate}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}