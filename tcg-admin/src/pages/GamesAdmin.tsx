import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, TowerControl as GameController, Search, Filter, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Game, GameInput } from '../types/database';
import { getGames, createGame, updateGame, deleteGame } from '../services/games';
import Modal from '../components/Modal';

const ITEMS_PER_PAGE = 9;
const CATEGORIAS = [
  'Estrategia',
  'Familiar',
  'Party',
  'Rol',
  'Deck Building',
  'Wargame',
  'TCG',
  'Otros'
];

export default function GamesAdmin() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  
  const [formData, setFormData] = useState<GameInput>({
    nombre: '',
    descripcion: '',
    categoria: '',
    edad_minima: 0,
    edad_maxima: null,
    jugadores_min: 1,
    jugadores_max: 4,
    duracion_min: 30,
    duracion_max: 60
  });

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    loadGames();
  }, [session, navigate]);

  async function loadGames() {
    try {
      const data = await getGames();
      setGames(data);
    } catch (err) {
      setError('Error al cargar los juegos');
    } finally {
      setLoading(false);
    }
  }

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          game.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategoria = !selectedCategoria || game.categoria === selectedCategoria;
      return matchesSearch && matchesCategoria;
    });
  }, [games, searchTerm, selectedCategoria]);

  const validateFormData = () => {
    const errors: string[] = [];

    if (formData.edad_maxima && formData.edad_maxima < formData.edad_minima) {
      errors.push('La edad máxima debe ser mayor que la edad mínima');
    }

    if (formData.jugadores_max < formData.jugadores_min) {
      errors.push('El número máximo de jugadores debe ser mayor o igual al mínimo');
    }

    if (formData.duracion_max < formData.duracion_min) {
      errors.push('La duración máxima debe ser mayor que la duración mínima');
    }

    if (formData.jugadores_min < 1) {
      errors.push('El número mínimo de jugadores debe ser al menos 1');
    }

    if (formData.edad_minima < 0) {
      errors.push('La edad mínima no puede ser negativa');
    }

    if (formData.duracion_min < 1) {
      errors.push('La duración mínima debe ser al menos 1 minuto');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGames, currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateFormData()) {
      return;
    }
    
    try {
      if (currentGame) {
        await updateGame(currentGame.id_juego, formData);
        setSuccess('Juego actualizado correctamente');
      } else {
        await createGame(formData);
        setSuccess('Juego creado correctamente');
      }
      setIsModalOpen(false);
      loadGames();
      resetForm();
    } catch (err) {
      setError('Error al guardar el juego');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este juego? Esta acción no se puede deshacer.')) return;
    
    try {
      await deleteGame(id);
      setSuccess('Juego eliminado correctamente');
      loadGames();
    } catch (err) {
      setError('Error al eliminar el juego');
    }
  };

  const resetForm = () => {
    setCurrentGame(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: '',
      edad_minima: 0,
      edad_maxima: null,
      jugadores_min: 1,
      jugadores_max: 4,
      duracion_min: 30,
      duracion_max: 60
    });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar juegos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="retro-input pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="retro-input"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="retro-button inline-flex items-center whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-press-start text-xs sm:text-sm">Nuevo Juego</span>
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-r-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGames.map((game) => (
                <div key={game.id_juego} className="retro-container bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-press-start text-sm text-gray-800 mb-2">
                        {game.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {game.descripcion}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Categoría:</span> {game.categoria}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Edad:</span> {game.edad_minima}
                          {game.edad_maxima ? `-${game.edad_maxima}` : '+'} años
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Jugadores:</span> {game.jugadores_min}-{game.jugadores_max}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Duración:</span> {game.duracion_min}-{game.duracion_max} min
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCurrentGame(game);
                          setFormData({
                            nombre: game.nombre,
                            descripcion: game.descripcion,
                            categoria: game.categoria,
                            edad_minima: game.edad_minima,
                            edad_maxima: game.edad_maxima,
                            jugadores_min: game.jugadores_min,
                            jugadores_max: game.jugadores_max,
                            duracion_min: game.duracion_min,
                            duracion_max: game.duracion_max
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id_juego)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="retro-button px-3 py-1 disabled:opacity-50"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`retro-button px-3 py-1 ${
                      currentPage === page ? 'bg-gray-800' : 'bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="retro-button px-3 py-1 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
            setValidationErrors([]);
          }}
          title={currentGame ? 'Editar Juego' : 'Nuevo Juego'}
        >
          {validationErrors.length > 0 && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              <div className="font-medium">Por favor, corrige los siguientes errores:</div>
              <ul className="mt-2 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="retro-input"
              />
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="retro-input h-24"
              />
            </div>

            <div>
              <label className="block font-press-start text-xs text-gray-700 mb-2">
                Categoría
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="retro-input"
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-press-start text-xs text-gray-700 mb-2">
                  Edad Mínima
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.edad_minima}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      edad_minima: value,
                      edad_maxima: value > (formData.edad_maxima || 0) ? value : formData.edad_maxima 
                    });
                  }}
                  className="retro-input"
                />
              </div>
              <div>
                <label className="block font-press-start text-xs text-gray-700 mb-2">
                  Edad Máxima
                </label>
                <input
                  type="number"
                  min={formData.edad_minima}
                  value={formData.edad_maxima || ''}
                  onChange={(e) => setFormData({ ...formData, edad_maxima: e.target.value ? parseInt(e.target.value) : null })}
                  className="retro-input"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-press-start text-xs text-gray-700 mb-2">
                  Jugadores Mínimo
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.jugadores_min}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      jugadores_min: value,
                      jugadores_max: value > formData.jugadores_max ? value : formData.jugadores_max 
                    });
                  }}
                  className="retro-input"
                />
              </div>
              <div>
                <label className="block font-press-start text-xs text-gray-700 mb-2">
                  Jugadores Máximo
                </label>
                <input
                  type="number"
                  required
                  min={formData.jugadores_min}
                  value={formData.jugadores_max}
                  onChange={(e) => setFormData({ ...formData, jugadores_max: parseInt(e.target.value) })}
                  className="retro-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-press-start text-xs text-gray-700 mb-2">
                  Duración Mínima (min)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duracion_min}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      duracion_min: value,
                      duracion_max: value > formData.duracion_max ? value : formData.duracion_max 
                    });
                  }}
                  className="retro-input"
                />
              </div>
              <div>
                <label className="block font-press-start text-xs text-gray-700 mb-2">
                  Duración Máxima (min)
                </label>
                <input
                  type="number"
                  required
                  min={formData.duracion_min}
                  value={formData.duracion_max}
                  onChange={(e) => setFormData({ ...formData, duracion_max: parseInt(e.target.value) })}
                  className="retro-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                  setValidationErrors([]);
                }}
                className="retro-button bg-gray-600 hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="retro-button"
                disabled={validationErrors.length > 0}
              >
                {currentGame ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}