import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Tooltip from '../components/Tooltip';
import Toast from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const validateForm = () => {
    const errors = {
      email: '',
      password: ''
    };
    let isValid = true;

    if (!email) {
      errors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }

    if (!password) {
      errors.password = 'La contraseña es requerida';
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (signInError) {
        switch (signInError.message) {
          case 'Invalid login credentials':
            toast.error('Correo electrónico o contraseña incorrectos');
            break;
          case 'Email not confirmed':
            toast.error('Por favor, confirma tu correo electrónico');
            break;
          default:
            toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.');
        }
        console.error('Auth error:', signInError);
      } else {
        toast.success('¡Bienvenido de vuelta!');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (session) return null;

  return (
    <div className="min-h-screen bg-[#FFFFE0] flex flex-col items-center justify-center p-4">
      <div className="scanlines" aria-hidden="true"></div>
      <Toast />
      <div 
        className="retro-container bg-white w-full max-w-md"
        role="main"
        aria-labelledby="login-title"
      >
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 mx-auto mb-4 text-gray-800" aria-hidden="true" />
          <h1 
            id="login-title" 
            className="font-press-start text-xl text-gray-800"
            tabIndex={-1}
          >
            Iniciar Sesión
          </h1>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          aria-label="Formulario de inicio de sesión"
          noValidate
        >
          <Tooltip label="Ingresa el correo electrónico con el que te registraste">
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
          </Tooltip>

          <Tooltip label="Ingresa tu contraseña (mínimo 6 caracteres)">
            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors.password}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </Tooltip>

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            Iniciar Sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 font-press-start">
          ¿No tienes una cuenta?{' '}
          <Link 
            to="/signup" 
            className="text-gray-800 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}