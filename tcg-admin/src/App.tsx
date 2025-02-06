import { useState } from 'react'
import { Car as Cards } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <Cards className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TCG Admin</h1>
        <p className="text-gray-600 mb-8">Tu plataforma de administración de cartas coleccionables</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setCount((count) => count + 1)}
        >
          Contador: {count}
        </button>
      </div>
    </div>
  )
}

export default App