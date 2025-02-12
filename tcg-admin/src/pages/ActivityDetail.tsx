import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Activity } from '../types/database';
import { getActivity } from '../services/activities';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    if (id) {
      loadActivity(id);
    }
  }, [id, session, navigate]);

  async function loadActivity(activityId: string) {
    try {
      const data = await getActivity(activityId);
      setActivity(data);
    } catch (err) {
      setError('Error al cargar la actividad');
    } finally {
      setLoading(false);
    }
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="retro-button mb-6 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-press-start text-xs">Volver</span>
        </button>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg pixel-corners">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-r-transparent"></div>
          </div>
        ) : activity ? (
          <div className="retro-container bg-white">
            <h1 className="font-press-start text-xl text-gray-800 mb-6">
              {activity.nombre}
            </h1>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3" />
                <span className="font-press-start text-sm">
                  {new Date(activity.fecha).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3" />
                <span className="font-press-start text-sm">
                  {activity.ubicacion}
                </span>
              </div>

              {activity.enlace_referencia && (
                <div className="flex items-center text-blue-600">
                  <LinkIcon className="w-5 h-5 mr-3" />
                  <a
                    href={activity.enlace_referencia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-press-start text-sm hover:text-blue-800"
                  >
                    Enlace de referencia
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-press-start text-sm text-gray-600">
              Actividad no encontrada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}