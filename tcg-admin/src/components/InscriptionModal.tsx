import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import Input from './Input';
import Modal from './Modal';

interface InscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  userId: string;
  activityName: string;
}

export default function InscriptionModal({
  isOpen,
  onClose,
  activityId,
  userId,
  activityName
}: InscriptionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comments: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insertar la inscripción en la tabla inscriptions
      // La tabla usa: id_usuario, id_actividad, fecha_registro
      const { error } = await supabase
        .from('inscriptions')
        .insert({
          id_usuario: userId,
          id_actividad: activityId,
          fecha_registro: new Date().toISOString()
        });

      if (error) {
        console.error('Error al guardar inscripción:', error);
        
        // Si el error es por duplicado (ya está inscrito)
        if (error.code === '23505' || error.message.includes('duplicate')) {
          toast.error('Ya estás inscrito en esta actividad');
        } else {
          toast.error('Error al guardar la inscripción. Intenta nuevamente.');
        }
        return;
      }

      toast.success('¡Inscripción realizada exitosamente!');
      
      // Limpiar formulario y cerrar modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        comments: ''
      });
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Error inesperado:', err);
      toast.error('Error inesperado al procesar la inscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        comments: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Inscribirse en: ${activityName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) {
              setErrors({ ...errors, name: '' });
            }
          }}
          error={errors.name}
          required
          placeholder="Tu nombre completo"
          disabled={isSubmitting}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) {
              setErrors({ ...errors, email: '' });
            }
          }}
          error={errors.email}
          required
          placeholder="tu@email.com"
          disabled={isSubmitting}
        />

        <Input
          label="Teléfono"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+56 9 1234 5678"
          disabled={isSubmitting}
        />

        <div className="w-full">
          <label className="block font-press-start text-xs text-gray-700 mb-2">
            Comentarios
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="retro-input h-24"
            placeholder="Comentarios adicionales (opcional)"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t-2 border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="retro-button-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="retro-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar inscripción'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

