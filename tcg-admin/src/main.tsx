import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { router } from './router'
import { LoadScript } from '@react-google-maps/api'
import { googleMapsApiKey, googleMapsLibraries } from './lib/googleMapsClient'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={googleMapsLibraries}
    >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LoadScript>
  </React.StrictMode>,
)