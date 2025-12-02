import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Modal from '../Modal';
import LoadingScreen from '../LoadingScreen';
import { User, Mail, Calendar } from 'lucide-react';

interface InscriptionWithUser {
  id_inscription: string;
  id_user: string;
  id_activity: string;
  inscription_date: string;
  spots: number;
  user?: {
    id_user: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface ViewInscriptionsModalProps {
  activityId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewInscriptionsModal({
  activityId,
  isOpen,
  onClose
}: ViewInscriptionsModalProps) {
  const [inscriptions, setInscriptions] = useState<InscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && activityId) {
      loadInscriptions();
    } else {
      // Limpiar datos al cerrar
      setInscriptions([]);
      setError('');
    }
  }, [isOpen, activityId]);

  async function loadInscriptions() {
    setLoading(true);
    setError('');

    try {
      // Primera consulta: obtener inscripciones filtradas por id_activity
      const { data: inscriptionsData, error: inscriptionsError } = await supabase
        .from('inscriptions')
        .select('id_inscription, id_user, id_activity, inscription_date, spots')
        .eq('id_activity', activityId)
        .order('inscription_date', { ascending: true });

      if (inscriptionsError) {
        console.error('Error al cargar inscripciones:', inscriptionsError);
        setError('Error al cargar las inscripciones');
        return;
      }

      if (!inscriptionsData || inscriptionsData.length === 0) {
        setInscriptions([]);
        return;
      }

      // Extraer los id_user únicos
      const userIds = [...new Set(inscriptionsData.map(ins => ins.id_user))];

      // Segunda consulta: obtener datos de usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id_user, email, first_name, last_name')
        .in('id_user', userIds);

      if (usersError) {
        console.error('Error al cargar usuarios:', usersError);
        setError('Error al cargar los datos de usuarios');
        return;
      }

      // Crear un mapa de usuarios por id_user para búsqueda rápida
      const usersMap = new Map(
        (usersData || []).map(user => [user.id_user, user])
      );

      // Combinar inscripciones con datos de usuarios
      const combinedData: InscriptionWithUser[] = inscriptionsData.map(inscription => ({
        ...inscription,
        user: usersMap.get(inscription.id_user) || null
      }));

      setInscriptions(combinedData);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Usuarios Inscritos"
      size="md"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-8">
            <LoadingScreen />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg border-2 border-red-700">
            {error}
          </div>
        ) : inscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-press-start text-sm text-gray-600">
              No hay inscritos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inscriptions.map((inscription) => (
              <div
                key={inscription.id_inscription}
                className="retro-container bg-gray-50 p-4 border-2 border-gray-300"
              >
                <div className="space-y-2">
                  {inscription.user ? (
                    <>
                      <div className="flex items-center text-gray-800">
                        <User className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" />
                        <span className="font-press-start text-xs">
                          {inscription.user.first_name && inscription.user.last_name
                            ? `${inscription.user.first_name} ${inscription.user.last_name}`
                            : inscription.user.first_name || inscription.user.last_name || 'Sin nombre'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
                        <span className="text-xs break-all">
                          {inscription.user.email || 'Sin email'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 text-xs">
                      Usuario no disponible
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-yellow-600" />
                    <span className="text-xs">
                      {formatDate(inscription.inscription_date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

