import { Car as Cards } from 'lucide-react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFFE0] flex flex-col items-center justify-center">
      <div className="scanlines"></div>
      <div className="retro-container bg-white text-center">
        <Cards className="w-16 h-16 mx-auto mb-4 text-gray-800" />
        <h1 className="font-press-start text-2xl text-gray-800 mb-4">TCG Admin</h1>
        <p className="text-gray-600 mb-8">Tu plataforma de administración de cartas coleccionables</p>
        <div className="flex justify-center">
          <Link
            to="/login"
            className="retro-button inline-flex items-center justify-center"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  )
}