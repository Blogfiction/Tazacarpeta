import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bell, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Modal from '../components/Modal';

export default function Settings() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    email_events: true,
    email_updates: true,
    push_events: true,
    push_updates: false
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password.new !== password.confirm) {
      setError('Las contraseñas nuevas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.new
      });

      if (updateError) throw updateError;

      setSuccess('Contraseña actualizada correctamente');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError('Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session?.user.id);

      if (deleteError) throw deleteError;

      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      setError('Error al eliminar la cuenta');
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setError('');
    setLoading(true);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single();

      if (profileError) throw profileError;

      const { data: activitiesData, error: activitiesError } = await supabase
        .from('inscriptions')
        .select('activities(*)')
        .eq('id_usuario', session?.user.id);

      if (activitiesError) throw activitiesError;

      const exportData = {
        profile: profileData,
        activities: activitiesData,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tcg-admin-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Cambio de Contraseña */}
          <div className="retro-container bg-white">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="w-5 h-5 text-gray-800" />
              <h2 className="font-press-start text-sm text-gray-800">
                Cambiar Contraseña
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  className="retro-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  className="retro-input"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  className="retro-input"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="retro-button"
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>

          {/* Notificaciones */}
          <div className="retro-container bg-white">
            <div className="flex items-center space-x-2 mb-6">
              <Bell className="w-5 h-5 text-gray-800" />
              <h2 className="font-press-start text-sm text-gray-800">
                Notificaciones
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Eventos por Email</h3>
                  <p className="text-sm text-gray-500">Recibe notificaciones de nuevos eventos</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email_events: !notifications.email_events })}
                  className={`w-11 h-6 flex items-center rounded-full transition-colors ${
                    notifications.email_events ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`w-4 h-4 transform transition-transform bg-white rounded-full shadow-sm ${
                      notifications.email_events ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Actualizaciones por Email</h3>
                  <p className="text-sm text-gray-500">Recibe noticias y actualizaciones importantes</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email_updates: !notifications.email_updates })}
                  className={`w-11 h-6 flex items-center rounded-full transition-colors ${
                    notifications.email_updates ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`w-4 h-4 transform transition-transform bg-white rounded-full shadow-sm ${
                      notifications.email_updates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Notificaciones Push de Eventos</h3>
                  <p className="text-sm text-gray-500">Recibe alertas en tu navegador</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, push_events: !notifications.push_events })}
                  className={`w-11 h-6 flex items-center rounded-full transition-colors ${
                    notifications.push_events ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`w-4 h-4 transform transition-transform bg-white rounded-full shadow-sm ${
                      notifications.push_events ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Datos y Privacidad */}
          <div className="retro-container bg-white">
            <div className="flex items-center space-x-2 mb-6">
              <Download className="w-5 h-5 text-gray-800" />
              <h2 className="font-press-start text-sm text-gray-800">
                Datos y Privacidad
              </h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleExportData}
                className="retro-button w-full justify-center"
                disabled={loading}
              >
                Exportar Mis Datos
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="retro-button w-full justify-center bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                Eliminar Mi Cuenta
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Confirmación para Eliminar Cuenta */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Eliminar Cuenta"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-press-start text-sm">¿Estás seguro?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="retro-button bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="retro-button bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}