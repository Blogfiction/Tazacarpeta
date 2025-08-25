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
    first_name: '',
    last_name: '',
    city: '',
    region: '',
    country: ''
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
        .from('users')
        .select('*')
        .eq('id_user', session?.user.id)
        .single();

      if (profileError) {
        console.error('Error cargando perfil:', profileError);
        // Si no existe el perfil, lo creamos
        if (profileError.code === 'PGRST116') {
          await createProfile();
          return;
        }
        throw profileError;
      }

      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        city: data.city || '',
        region: data.region || '',
        country: data.country || ''
      });
    } catch (err) {
      console.error('Error en loadProfile:', err);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }

  async function createProfile() {
    try {
      const { data, error: createError } = await supabase
        .from('users')
        .insert({
          id_user: session?.user.id,
          first_name: null,
          last_name: null,
          city: null,
          region: null,
          country: null,
          email: session?.user.email
        })
        .select()
        .single();

      if (createError) throw createError;

      setProfile(data);
      setFormData({
        first_name: '',
        last_name: '',
        city: '',
        region: '',
        country: ''
      });
    } catch (err) {
      console.error('Error creando perfil:', err);
      setError('Error al crear el perfil');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update(formData)
        .eq('id_user', session?.user.id);

      if (updateError) throw updateError;

      setEditing(false);
      loadProfile();
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError('Error al actualizar el perfil');
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFE0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

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
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : session.user.email}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Usuario
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
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
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
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="retro-input"
                        placeholder="Tu ciudad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Región
                      </label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="retro-input"
                        placeholder="Tu región"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                    {profile?.city && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Ubicación</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {`${profile.city}, ${profile.region}, ${profile.country}`}
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