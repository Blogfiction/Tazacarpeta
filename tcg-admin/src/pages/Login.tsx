import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Tooltip from '../components/Tooltip';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import AuthService from '../services/auth';
import { SecurityService, SecurityEventType } from '../services/security';
import { validate } from '../lib/validation';

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

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: ''
    };
    let isValid = true;

    // Validar email con nuestra utilidad de validación
    if (!email) {
      errors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!validate.email(email)) {
      errors.email = 'Ingresa un correo electrónico válido';
      isValid = false;
    }

    // Validar password
    if (!password) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (!validate.length(password, 6)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
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
      // Sanitizar entradas para prevenir inyecciones
      const sanitizedEmail = validate.sanitize(email.trim());
      
      // Usar el nuevo servicio de autenticación
      const response = await AuthService.login({
        email: sanitizedEmail,
        password: password.trim()
      });

      if (response.error) {
        // La mayoría de los errores ya son manejados por el servicio
        // pero podemos manejar casos específicos adicionales aquí
        toast.error('Credenciales inválidas');
        
        // Registrar intento fallido de inicio de sesión
        await SecurityService.logLoginFailure(
          sanitizedEmail, 
          response.error.message
        );
      } else if (response.data.session) {
        toast.success('¡Bienvenido de vuelta!');
        
        // Registrar inicio de sesión exitoso
        if (response.data.user) {
          await SecurityService.logLoginSuccess(response.data.user.id);
        }
        
        // La redirección se maneja automáticamente por el hook useAuth
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Mostrar mensaje de error amigable sin detalles técnicos
      toast.error(err.message || 'Error al conectar con el servidor');
      
      // Registrar error
      await SecurityService.logLoginFailure(
        email, 
        err.message || 'Error desconocido'
      );
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