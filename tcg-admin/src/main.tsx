import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { router } from './router'
import { LoadScript } from '@react-google-maps/api'
import './index.css'

const libraries: ("places")[] = ["places"];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LoadScript
      googleMapsApiKey="AIzaSyAIijVIgmMnath-I-4sT-NVPgxv8j-rLhI"
      libraries={libraries}
    >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LoadScript>
  </React.StrictMode>,
)