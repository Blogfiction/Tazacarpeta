import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, TowerControl as GameController, Search, Filter, AlertTriangle, Check, 
         ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Game, GameInput } from '../types/database';
import { getGames, createGame, updateGame, deleteGame } from '../services/games';
import Modal from '../components/Modal';
import LoadingScreen from '../components/LoadingScreen';

const ITEMS_PER_PAGE = 6;
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
  const { session, user, isAdmin, isClient } = useAuth();
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
    name: '',
    description: '',
    category: '',
    min_age: 0,
    max_age: undefined,
    min_players: 1,
    max_players: 4,
    min_duration: 30,
    max_duration: 60
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
      // Los juegos son compartidos para todos los usuarios (admin y cliente)
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
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategoria = !selectedCategoria || game.category === selectedCategoria;
      return matchesSearch && matchesCategoria;
    });
  }, [games, searchTerm, selectedCategoria]);

  const validateFormData = () => {
    const errors: string[] = [];

    // Validar campos requeridos
    if (!formData.name || formData.name.trim() === '') {
      errors.push('El nombre del juego es requerido');
    }

    if (!formData.description || formData.description.trim() === '') {
      errors.push('La descripción es requerida');
    }

    if (!formData.category || formData.category.trim() === '') {
      errors.push('La categoría es requerida');
    }

    // Validar rangos
    if (formData.max_age && formData.max_age < formData.min_age) {
      errors.push('La edad máxima debe ser mayor que la edad mínima');
    }

    if (formData.max_players < formData.min_players) {
      errors.push('El número máximo de jugadores debe ser mayor o igual al mínimo');
    }

    if (formData.max_duration < formData.min_duration) {
      errors.push('La duración máxima debe ser mayor que la duración mínima');
    }

    if (formData.min_players < 1) {
      errors.push('El número mínimo de jugadores debe ser al menos 1');
    }

    if (formData.min_age < 0) {
      errors.push('La edad mínima no puede ser negativa');
    }

    if (formData.min_duration < 1) {
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
    
    // Prepare data ensuring max_age is number or null
    const preparedFormData = {
      ...formData,
      max_age: formData.max_age === undefined ? null : formData.max_age,
    };
    
    try {
      if (currentGame) {
        await updateGame(currentGame.id_game, preparedFormData);
        setSuccess('Juego actualizado correctamente');
      } else {
        await createGame(preparedFormData);
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
      name: '',
      description: '',
      category: '',
      min_age: 0,
      max_age: undefined,
      min_players: 1,
      max_players: 4,
      min_duration: 30,
      max_duration: 60
    });
  };

  if (!session) return null;

  const renderPaginationControls = (
    currentPageNum: number, 
    totalPagesNum: number, 
    setPage: (page: number | ((prev: number) => number)) => void,
  ) => {
    if (totalPagesNum <= 1) return null;
    
    return (
      <div className="flex items-center justify-center mt-6 py-2">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPageNum === 1}
            className={`retro-button p-2 text-xs sm:p-2 ${currentPageNum === 1 ? 'bg-gray-400 opacity-70 cursor-not-allowed' : 'bg-gray-600'}`}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-['Press_Start_2P'] text-sm text-gray-800 whitespace-nowrap">
            Pág {currentPageNum} / {totalPagesNum}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPagesNum))}
            disabled={currentPageNum === totalPagesNum}
            className={`retro-button p-2 text-xs sm:p-2 ${currentPageNum === totalPagesNum ? 'bg-gray-400 opacity-70 cursor-not-allowed' : 'bg-gray-800'}`}
            aria-label="Página siguiente"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFE0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="retro-button inline-flex items-center whitespace-nowrap min-w-[140px] justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-press-start text-xs">Nuevo Juego</span>
            </button>

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
              className="retro-input flex-1 sm:flex-none"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
          <LoadingScreen />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGames.map((game) => (
                <div key={game.id_game} className="retro-container bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-press-start text-sm text-gray-800 mb-2">
                        {game.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {game.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Categoría:</span> {game.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Edad:</span> {game.min_age}
                          {game.max_age ? `-${game.max_age}` : '+'} años
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Jugadores:</span> {game.min_players}-{game.max_players}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Duración:</span> {game.min_duration}-{game.max_duration} min
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCurrentGame(game);
                          setFormData({
                            name: game.name,
                            description: game.description,
                            category: game.category,
                            min_age: game.min_age,
                            max_age: game.max_age || undefined,
                            min_players: game.min_players,
                            max_players: game.max_players,
                            min_duration: game.min_duration,
                            max_duration: game.max_duration
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id_game)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {renderPaginationControls(currentPage, totalPages, setCurrentPage)}

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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="retro-input"
                  />
                </div>

                <div>
                  <label className="block font-press-start text-xs text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="retro-input h-24"
                  />
                </div>

                <div>
                  <label className="block font-press-start text-xs text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                      value={formData.min_age}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({ 
                          ...formData, 
                          min_age: value,
                          max_age: value > (formData.max_age || 0) ? value : formData.max_age 
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
                      min={formData.min_age}
                      value={formData.max_age || ''}
                      onChange={(e) => setFormData({ ...formData, max_age: e.target.value ? parseInt(e.target.value) : undefined })}
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
                      value={formData.min_players}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({ 
                          ...formData, 
                          min_players: value,
                          max_players: value > formData.max_players ? value : formData.max_players 
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
                      min={formData.min_players}
                      value={formData.max_players}
                      onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
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
                      value={formData.min_duration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({ 
                          ...formData, 
                          min_duration: value,
                          max_duration: value > formData.max_duration ? value : formData.max_duration 
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
                      min={formData.min_duration}
                      value={formData.max_duration}
                      onChange={(e) => setFormData({ ...formData, max_duration: parseInt(e.target.value) })}
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
          </>
        )}
      </div>
    </div>
  );
}