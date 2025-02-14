import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/Button';
import Input from '../components/Input';
import Toast from '../components/Toast';
import toast from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    // Validación de email
    if (!email) {
      errors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }

    // Validación de contraseña
    if (!password) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    // Validación de confirmación de contraseña
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        switch (error.message) {
          case 'User already registered':
            toast.error('Este correo electrónico ya está registrado');
            break;
          case 'Password should be at least 6 characters':
            toast.error('La contraseña debe tener al menos 6 caracteres');
            break;
          case 'Database error saving new user':
            toast.error('Error al crear el usuario. Por favor, intenta de nuevo más tarde');
            break;
          default:
            toast.error(error.message);
        }
      } else if (data.user) {
        toast.success('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
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
            label="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
            required
            disabled={loading}
            autoComplete="email"
            autoFocus
          />

          <Input
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={formErrors.password}
            helperText="Mínimo 6 caracteres"
            required
            disabled={loading}
            autoComplete="new-password"
          />

          <Input
            type="password"
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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