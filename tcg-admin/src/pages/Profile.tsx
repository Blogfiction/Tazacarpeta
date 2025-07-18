import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/database';

export default function Profile() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ciudad: '',
    comuna_region: '',
    pais: ''
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [session, navigate]);

  async function loadProfile() {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(data);
      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        ciudad: data.ciudad || '',
        comuna_region: data.comuna_region || '',
        pais: data.pais || ''
      });
    } catch (err) {
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', session?.user.id);

      if (updateError) throw updateError;

      setEditing(false);
      loadProfile();
    } catch (err) {
      setError('Error al actualizar el perfil');
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil Principal */}
          <div className="lg:col-span-2">
            <div className="retro-container bg-white">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-yellow-200" />
                  </div>
                  <div>
                    <h2 className="font-press-start text-sm sm:text-base text-gray-800">
                      {profile?.nombre ? `${profile.nombre} ${profile.apellido}` : session.user.email}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {profile?.tipo_plan || 'Plan Básico'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="retro-button text-xs"
                >
                  {editing ? 'Cancelar' : 'Editar Perfil'}
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="retro-input"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className="retro-input"
                        placeholder="Tu apellido"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={formData.ciudad}
                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                        className="retro-input"
                        placeholder="Tu ciudad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comuna/Región
                      </label>
                      <input
                        type="text"
                        value={formData.comuna_region}
                        onChange={(e) => setFormData({ ...formData, comuna_region: e.target.value })}
                        className="retro-input"
                        placeholder="Tu comuna o región"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        value={formData.pais}
                        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                        className="retro-input"
                        placeholder="Tu país"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="retro-button bg-gray-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="retro-button"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">{session.user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Miembro desde</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(session.user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {profile?.ciudad && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Ubicación</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {`${profile.ciudad}, ${profile.comuna_region}, ${profile.pais}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas y Actividad */}
          <div className="lg:col-span-1 space-y-6">
            <div className="retro-container bg-white">
              <h3 className="font-press-start text-sm text-gray-800 mb-4">
                Estadísticas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Eventos Asistidos</span>
                  </div>
                  <span className="font-press-start text-sm text-gray-800">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Nivel de Actividad</span>
                  </div>
                  <span className="font-press-start text-sm text-gray-800">Bajo</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-600">Notificaciones</span>
                  </div>
                  <span className="font-press-start text-sm text-gray-800">Activas</span>
                </div>
              </div>
            </div>

            <div className="retro-container bg-white">
              <h3 className="font-press-start text-sm text-gray-800 mb-4">
                Actividad Reciente
              </h3>
              <div className="text-center py-8 text-sm text-gray-500">
                No hay actividad reciente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}