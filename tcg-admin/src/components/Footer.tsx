import { Instagram, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 border-t-4 border-gray-900 text-gray-300 py-8 mt-auto">
      <div className="container-fluid">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Menú Principal */}
          <div className="space-y-4">
            <h3 className="font-press-start text-xs text-yellow-200 mb-4">Menú Principal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.instagram.com/blogfictioncl/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-yellow-200 transition-colors"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  <span className="text-sm">Blogfiction</span>
                </a>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="flex items-center hover:text-yellow-200 transition-colors"
                >
                  <span className="text-sm">Política de Privacidad</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="flex items-center hover:text-yellow-200 transition-colors"
                >
                  <span className="text-sm">Términos y Condiciones</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Información Legal */}
          <div className="space-y-4">
            <h3 className="font-press-start text-xs text-yellow-200 mb-4">Información Legal</h3>
            <div className="space-y-2">
              <p className="text-sm">© {currentYear} Blogfiction</p>
              <p className="text-sm">Todos los derechos reservados.</p>
            </div>
          </div>

          {/* Firma del Desarrollador */}
          <div className="space-y-4">
            <h3 className="font-press-start text-xs text-yellow-200 mb-4">Desarrolladores</h3>
            <div className="space-y-4">
              <p className="text-sm mb-3">Hecho con ❤️ por</p>
              
              <a 
                href="https://yeyobitz.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center group mb-3 relative glitch-link"
              >
                <Code className="w-4 h-4 mr-2 group-hover:text-red-400 transition-all duration-100" />
                <span className="text-xs relative inline-block group-hover:text-cyan-400 transition-all duration-100">
                  Yeyobitz.dev
                  <span className="absolute left-0 top-0 w-full opacity-0 group-hover:opacity-70 group-hover:-translate-x-[1px] group-hover:translate-y-[1px] text-red-400 transition-all duration-75">Yeyobitz.dev</span>
                  <span className="absolute left-0 top-0 w-full opacity-0 group-hover:opacity-70 group-hover:translate-x-[1px] group-hover:-translate-y-[1px] text-cyan-400 transition-all duration-75">Yeyobitz.dev</span>
                </span>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/esteban-venegas-b06131281/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center group relative glitch-link"
              >
                <Code className="w-4 h-4 mr-2 group-hover:text-red-400 transition-all duration-100" />
                <span className="text-xs relative inline-block group-hover:text-cyan-400 transition-all duration-100">
                  Esteban Venegas
                  <span className="absolute left-0 top-0 w-full opacity-0 group-hover:opacity-70 group-hover:-translate-x-[1px] group-hover:translate-y-[1px] text-red-400 transition-all duration-75">Esteban Venegas</span>
                  <span className="absolute left-0 top-0 w-full opacity-0 group-hover:opacity-70 group-hover:translate-x-[1px] group-hover:-translate-y-[1px] text-cyan-400 transition-all duration-75">Esteban Venegas</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Pixel Art Border */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex justify-center">
            <div className="pixel-art-border h-2 w-full max-w-md bg-gray-700 relative">
              <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-200"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-200"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}