import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/Button';
import Input from '../components/Input';
import Toast from '../components/Toast';
import Footer from '../components/Footer';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    city: '',
    region: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { session } = useAuth();

  // Si ya está autenticado, redirigir al dashboard
  if (session) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Crear usuario en Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            city: formData.city,
            region: formData.region,
            country: formData.country
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccess('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        
        // Limpiar formulario
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          city: '',
          region: '',
          country: ''
        });

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            tabIndex={-1}
          >
            Crear Cuenta
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg">
            {success}
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          aria-label="Formulario de registro"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={loading}
              autoComplete="given-name"
            />
            <Input
              label="Apellido"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={loading}
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
            autoComplete="email"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              autoComplete="new-password"
              minLength={6}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="address-level2"
            />
            <Input
              label="Región"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="address-level1"
            />
            <Input
              label="País"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              disabled={loading}
              autoComplete="country"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            Crear Cuenta
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
      <Footer />
    </div>
  );
}
