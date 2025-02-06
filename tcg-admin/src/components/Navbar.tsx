import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Store, 
  Menu,
  X
} from 'lucide-react';
import UserProfile from './UserProfile';

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Actividades', href: '/activities', icon: CalendarIcon },
    { name: 'Tiendas', href: '/stores', icon: Store },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-200 h-[var(--navbar-height)] sm:h-[var(--navbar-height-sm)]
                    ${isScrolled ? 'bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-gray-800/75' : 'bg-gray-800'}
                    border-b-4 border-gray-900`}>
      <div className="container-fluid h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 min-h-[44px] min-w-[44px] px-2"
            >
              <LayoutDashboard className="h-6 w-6 text-yellow-200" />
              <span className="hidden xs:block font-press-start text-yellow-200 text-xs sm:text-sm">TCG Admin</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-press-start transition-colors
                             min-h-[44px] min-w-[44px]
                             ${isActive(item.href)
                               ? 'text-yellow-200 border-b-2 border-yellow-200'
                               : 'text-gray-300 hover:text-yellow-200'}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <UserProfile />

            {/* Mobile menu button - Improved touch target */}
            <button
              onClick={handleMenuToggle}
              className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 
                       text-gray-300 hover:text-yellow-200 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label="Menú principal"
            >
              <span className="sr-only">
                {isMenuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
              </span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu - Improved animation and interaction */}
        <div 
          className={`md:hidden fixed left-0 right-0 bg-gray-800 border-b-4 border-gray-900 
                     shadow-lg transition-all duration-300 ease-in-out transform
                     ${isMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'}`}
          aria-hidden={!isMenuOpen}
        >
          <div className="container-fluid py-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block w-full min-h-[44px] pl-3 pr-4 py-2 font-press-start text-xs
                             transition-colors duration-200
                             ${isActive(item.href)
                               ? 'text-yellow-200 bg-gray-900 border-l-4 border-yellow-200'
                               : 'text-gray-300 hover:bg-gray-700 hover:text-yellow-200'}`}
                  onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}