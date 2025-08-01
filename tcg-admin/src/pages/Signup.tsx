import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

// Comunas de la Octava Región (Región del Biobío)
const COMUNAS = [
  'Alto Biobío',
  'Antuco',
  'Arauco',
  'Cabrero',
  'Cañete',
  'Chiguayante',
  'Concepción',
  'Contulmo',
  'Coronel',
  'Curanilahue',
  'Florida',
  'Hualpén',
  'Hualqui',
  'Laja',
  'Lebu',
  'Los Álamos',
  'Los Ángeles',
  'Lota',
  'Mulchén',
  'Nacimiento',
  'Negrete',
  'Penco',
  'Quilaco',
  'Quilleco',
  'San Pedro de la Paz',
  'San Rosendo',
  'Santa Bárbara',
  'Santa Juana',
  'Talcahuano',
  'Tirúa',
  'Tomé',
  'Tucapel',
  'Yumbel'
].sort();

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    comuna: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    comuna: ''
  });
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      comuna: ''
    };
    let isValid = true;

    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.comuna) {
      errors.comuna = 'La comuna es requerida';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Función para hashear con SHA-256
  async function hashPasswordSHA256(password: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    // Convertir ArrayBuffer a hex string
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Hashear la contraseña antes de guardar (SHA-256)
      const passwordHash = await hashPasswordSHA256(formData.password.trim());

      // Insertar en la tabla 'users' personalizada
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id_user: crypto.randomUUID(), // Genera un UUID para el usuario
            first_name: formData.nombre.trim(), // nombre -> first_name
            last_name: '', // Si quieres pedirlo, agrégalo al formulario
            city: '',      // Si quieres pedirlo, agrégalo al formulario
            region: '',    // No se usa comuna aquí
            country: formData.comuna, // comuna -> country
            updated_at: new Date().toISOString(),
            email: formData.email.trim(),
            total_searches: 0,
            total_inscriptions: 0,
            last_activity: null,
            created_at: new Date().toISOString(),
            id_plan: null, // O el valor por defecto que corresponda
            id_role: null, // O el valor por defecto que corresponda
            password_hash: passwordHash
          }
        ]);
      if (dbError) {
        console.error('Error al guardar en users:', dbError);
        toast.error('Error al guardar el usuario en la base de datos');
        setLoading(false);
        return;
      }
      toast.success('Registro exitoso. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error inesperado durante el registro:', err);
      toast.error('Error al conectar con el servidor. Por favor, intenta de nuevo más tarde');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#FFFFE0] flex flex-col items-center justify-center p-4">
      <div className="scanlines" aria-hidden="true"></div>
      <Toast />
      <div 
        className="retro-container bg-white w-full max-w-md"
        role="main"
        aria-labelledby="signup-title"
      >
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-800" aria-hidden="true" />
          <h1 
            id="signup-title" 
            className="font-press-start text-xl text-gray-800"
          >
            Crear Cuenta
          </h1>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          aria-label="Formulario de registro"
          noValidate
        >
          <Input
            type="email"
            name="email"
            label="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
            disabled={loading}
            autoComplete="email"
            autoFocus
          />

          <Input
            type="text"
            name="nombre"
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={formErrors.nombre}
            required
            disabled={loading}
            autoComplete="name"
          />

          <Select
            name="comuna"
            label="Comuna"
            value={formData.comuna}
            onChange={handleChange}
            error={formErrors.comuna}
            options={[
              { value: '', label: 'Selecciona una comuna' },
              ...COMUNAS.map(comuna => ({
                value: comuna,
                label: comuna
              }))
            ]}
            required
            disabled={loading}
          />

          <Input
            type="password"
            name="password"
            label="Contraseña"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            helperText="Mínimo 6 caracteres"
            required
            disabled={loading}
            autoComplete="new-password"
          />

          <Input
            type="password"
            name="confirmPassword"
            label="Confirmar Contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            required
            disabled={loading}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            Registrarse
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 font-press-start">
          ¿Ya tienes una cuenta?{' '}
          <Link 
            to="/login" 
            className="text-gray-800 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
          >
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}