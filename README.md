# TCG Admin - Documentación del Proyecto

## Visión General del Sistema

TCG Admin es un sistema integral de gestión diseñado para tiendas y eventos de juegos de cartas coleccionables. El sistema proporciona herramientas para gestionar inventario, organizar eventos y realizar seguimiento de actividades de las tiendas.

## Estado de Implementación

### Características Completadas ✅

1. Sistema de Autenticación
   - Autenticación basada en email con Supabase
   - Gestión de perfiles de usuario
   - Manejo de sesiones
   - Flujos de inicio de sesión/registro
   - Control de acceso basado en roles (Admin, Cliente, Usuario)

2. Framework UI Básico
   - Implementación de diseño responsivo
   - Tema de estilo retro con estética de pixel art
   - Biblioteca de componentes (Botón, Input, Modal, etc.)
   - Notificaciones Toast
   - Estados de carga
   - Navegación mejorada con botones compactos y estilizados
   - Integración con Google Maps para autocompletado de direcciones
   - Componentes de gráficos (Recharts, Chart.js)

3. Esquema de Base de Datos
   - Todas las tablas principales creadas
   - Seguridad a nivel de fila (RLS) implementada
   - Relaciones básicas establecidas
   - Triggers automáticos para actualización de timestamps
   - Tabla de logs de seguridad

4. Páginas Principales
   - Vista de Dashboard con analíticas en tiempo real
   - Gestión de Actividades (CRUD completo)
   - Gestión de Juegos (CRUD completo)
   - Gestión de Tiendas (CRUD completo)
   - Administración de Usuarios (solo para Admin)
   - Perfil de usuario
   - Configuración
   - Página de Reportes con herramientas completas de exportación
   - Vista de detalle de actividades

5. Sistema de Exportación de Datos
   - Generación de reportes PDF
   - Múltiples tipos de reportes (Actividades, Juegos, Tiendas, Dashboard, Historial, Búsquedas, Usuarios)
   - Reportes mensuales, trimestrales, semestrales y anuales
   - Parámetros de reportes personalizables
   - Filtrado por rango de fechas
   - Filtros específicos por tienda y juego
   - Visualización de datos con gráficos
   - Manejo robusto de errores
   - Guardado de reportes en base de datos

6. Sistema de Analíticas
   - Dashboard con métricas en tiempo real
   - Análisis de tiendas más visitadas
   - Análisis de juegos más jugados
   - Análisis de actividades más concurridas
   - Tendencias temporales
   - Participación por categorías de juegos
   - Estadísticas de usuarios

### En Progreso 🚧

1. Gestión de Datos
   - Seguimiento de inventario de tiendas
   - Sistema de registro para eventos
   - Análisis de actividades

2. Experiencia de Usuario
   - Validaciones de formularios (necesita reimplementación)
   - Mejoras en el manejo de errores
   - Optimizaciones de estados de carga
   - Refinamiento y consistencia de la interfaz

### Características Pendientes ⏳

1. Características Avanzadas
   - Implementación del plan de suscripción
   - Análisis avanzados
   - Operaciones por lotes

2. Optimizaciones de Rendimiento
   - Optimización de consultas
   - Implementación de caché
   - Optimización de recursos

3. Pruebas
   - Pruebas unitarias
   - Pruebas de integración
   - Pruebas de extremo a extremo

## Características Principales

### 1. Sistema de Autenticación
- Autenticación basada en email con Supabase
- Gestión de perfiles de usuario con campos personalizables
- Control de acceso basado en roles
- Gestión segura de sesiones
- Recuperación y actualización de contraseñas

### 2. Gestión de Juegos
- Operaciones CRUD para juegos
- Capacidades avanzadas de filtrado y búsqueda
- Sistema de categorización con categorías predefinidas
- Restricciones de edad y número de jugadores
- Seguimiento de duración
- Gestión de stock y precios por tienda
- Categorías:
  - Estrategia
  - Familia
  - Fiesta
  - Rol
  - Construcción de mazos
  - Wargame
  - TCG (Juegos de Cartas Coleccionables)
  - Otros

### 3. Gestión de Tiendas
- Gestión de perfiles de tiendas con información detallada
- Configuración de horarios con programación flexible
- Gestión de ubicaciones con validación de direcciones
- Seguimiento de inventario con actualizaciones en tiempo real
- Soporte para múltiples tiendas
- Gestión de inventario de juegos por tienda
- Gestión de planes de suscripción (Básico, Premium, Enterprise)

### 4. Gestión de Actividades
- Creación y gestión de eventos (CRUD completo)
- Sistema de registro para eventos
- Integración con calendario con interfaz visual
- Seguimiento de ubicación con autocompletado de direcciones
- Asociación con juegos
- Asociación con tiendas
- Soporte para enlaces de referencia
- Seguimiento del estado de eventos
- Filtrado por tienda y juego
- Actualización automática de timestamps
- Vista de detalle de actividades

### 5. Interfaz de Usuario
- Diseño responsivo para todos los dispositivos
- Tema de estilo retro con estética de pixel art
- Características de accesibilidad (ARIA, navegación por teclado)
- Notificaciones Toast para feedback al usuario
- Diálogos modales para interacciones complejas
- Tooltips interactivos para texto de ayuda
- Estados de carga y manejo de errores
- Sistema de navegación compacto y estilizado
- Lenguaje visual consistente en toda la aplicación

### 6. Sistema de Reportes
- Generación completa de reportes PDF
- Múltiples tipos de reportes (Actividades, Tiendas, Juegos, Dashboard, Historial, Búsquedas, Usuarios)
- Reportes periódicos (mensuales, trimestrales, semestrales, anuales)
- Capacidades avanzadas de filtrado
- Selección de rango de fechas para reportes basados en tiempo
- Filtrado específico por tienda y juego
- Visualización de métricas clave mediante gráficos
- Secciones de resumen ejecutivo
- Tablas detalladas de datos
- Análisis de tendencias
- Guardado de reportes generados
- Manejo robusto de errores y contenido alternativo
- Formato y estilo profesional

### 7. Administración de Usuarios
- Panel de administración exclusivo para usuarios Admin
- Creación, edición y eliminación de usuarios
- Asignación y modificación de roles
- Cambio de contraseñas
- Estadísticas de usuarios en tiempo real
- Filtros y búsqueda de usuarios
- Validación de permisos y seguridad

### 8. Sistema de Analíticas
- Dashboard con métricas en tiempo real
- Análisis de tiendas más visitadas
- Análisis de juegos más clickeados y jugados
- Análisis de actividades más concurridas
- Tendencias temporales (búsquedas, actividades, inscripciones)
- Participación por categorías de juegos
- Estadísticas de usuarios activos
- Filtros avanzados por fecha, tienda, juego y categoría

## Esquema de Base de Datos

### Visión General de Tablas

#### activities
| Columna           | Tipo      | Descripción                                |
|-------------------|-----------|-------------------------------------------|
| id_activity       | UUID      | Clave primaria para identificación de actividad |
| id_store          | UUID      | Referencia a la tienda anfitriona         |
| id_game           | UUID      | Referencia al juego destacado             |
| name_activity     | TEXT      | Nombre/título de la actividad             |
| date              | TIMESTAMP | Fecha y hora del evento                   |
| adress_activity   | TEXT      | Ubicación/dirección del evento             |
| reference_link    | TEXT      | Enlace de referencia/registro opcional    |
| id_users          | UUID      | Referencia al usuario que creó la actividad |
| created_at        | TIMESTAMP | Marca de tiempo de creación del registro  |
| updated_at        | TIMESTAMP | Marca de tiempo de última modificación (actualizado automáticamente) |

#### games
| Columna        | Tipo      | Descripción                                |
|---------------|-----------|-------------------------------------------|
| id_game        | UUID      | Clave primaria para identificación de juego |
| name           | TEXT      | Nombre del juego                          |
| description    | TEXT      | Descripción detallada del juego           |
| category       | VARCHAR   | Categoría del juego (Estrategia, TCG, etc.) |
| min_age        | INTEGER   | Edad mínima recomendada                   |
| max_age        | INTEGER   | Edad máxima recomendada (opcional)        |
| min_players     | INTEGER   | Número mínimo de jugadores                |
| max_players     | INTEGER   | Número máximo de jugadores                |
| min_duration   | INTEGER   | Tiempo mínimo de juego en minutos         |
| max_duration   | INTEGER   | Tiempo máximo de juego en minutos         |
| created_at     | TIMESTAMP | Marca de tiempo de creación del registro  |
| updated_at     | TIMESTAMP | Marca de tiempo de última modificación    |

#### stores
| Columna     | Tipo      | Descripción                                |
|------------|-----------|-------------------------------------------|
| id_store   | UUID      | Clave primaria para identificación de tienda |
| name_store | TEXT      | Nombre de la tienda                       |
| adress     | TEXT      | Dirección de la tienda                    |
| phone      | INTEGER   | Teléfono de contacto (opcional)          |
| email      | TEXT      | Email de contacto (opcional)              |
| latitude   | DECIMAL   | Latitud geográfica (opcional)              |
| longitude  | DECIMAL   | Longitud geográfica (opcional)            |
| id_users   | UUID      | Referencia al usuario propietario         |
| created_at | TIMESTAMP | Marca de tiempo de creación del registro  |
| updated_at | TIMESTAMP | Marca de tiempo de última modificación    |

#### store_games
| Columna     | Tipo      | Descripción                                |
|------------|-----------|-------------------------------------------|
| id_tienda  | UUID      | Referencia a tienda (clave primaria compuesta) |
| id_juego   | UUID      | Referencia a juego (clave primaria compuesta) |
| stock      | INTEGER   | Cantidad actual de stock                   |
| precio      | DECIMAL   | Precio actual                             |
| created_at | TIMESTAMP | Marca de tiempo de creación del registro  |

#### users (profiles)
| Columna        | Tipo      | Descripción                                |
|---------------|-----------|-------------------------------------------|
| id_user        | UUID      | Clave primaria (enlaza a auth.users)      |
| first_name     | TEXT      | Nombre del usuario                        |
| last_name      | TEXT      | Apellido del usuario                      |
| city           | TEXT      | Ciudad del usuario                        |
| region         | TEXT      | Región del usuario                        |
| country        | TEXT      | País del usuario                          |
| email          | TEXT      | Email del usuario                          |
| id_role        | UUID      | Referencia al rol del usuario              |
| created_at     | TIMESTAMP | Marca de tiempo de creación del registro  |
| updated_at     | TIMESTAMP | Marca de tiempo de última modificación    |

#### inscriptions
| Columna         | Tipo      | Descripción                                |
|----------------|-----------|-------------------------------------------|
| id_user        | UUID      | Referencia al usuario (clave primaria compuesta) |
| id_activity     | UUID      | Referencia a la actividad (clave primaria compuesta) |
| inscription_date| TIMESTAMP | Marca de tiempo de registro               |

#### searches
| Columna          | Tipo      | Descripción                                |
|-----------------|-----------|-------------------------------------------|
| id_search        | UUID      | Clave primaria para registro de búsqueda  |
| id_user          | UUID      | Referencia al usuario que busca           |
| search_type      | TEXT      | Tipo/categoría de búsqueda (TCG, etc.)   |
| search_term      | TEXT      | Término de consulta de búsqueda           |
| total_searches    | INTEGER   | Total de búsquedas realizadas             |
| date_time        | TIMESTAMP | Marca de tiempo de búsqueda              |

#### reports
| Columna           | Tipo      | Descripción                                |
|------------------|-----------|-------------------------------------------|
| id_informe       | UUID      | Clave primaria para informe               |
| tipo_informe     | TEXT      | Identificador del tipo de informe         |
| fecha_generacion | TIMESTAMP | Marca de tiempo de generación de informe  |
| parametros       | JSONB     | Parámetros y configuraciones del informe  |

#### history
| Columna           | Tipo      | Descripción                                |
|------------------|-----------|-------------------------------------------|
| id_history        | UUID      | Clave primaria para registro de historial |
| id_stores         | UUID      | Referencia a tienda (opcional)            |
| id_activity       | UUID      | Referencia a actividad (opcional)         |
| id_users          | UUID      | Referencia al usuario                      |
| store_name        | TEXT      | Nombre de la tienda                        |
| activity_name     | TEXT      | Nombre de la actividad                     |
| game_name         | TEXT      | Nombre del juego                           |
| tipe_activity     | TEXT      | Tipo de actividad (VIEW_ACTIVITY, INSCRIPTION, etc.) |
| date_history      | TIMESTAMP | Marca de tiempo del evento                 |

#### security_logs
| Columna           | Tipo      | Descripción                                |
|------------------|-----------|-------------------------------------------|
| id_log            | UUID      | Clave primaria para registro de log       |
| user_id           | UUID      | Referencia al usuario                      |
| action            | TEXT      | Acción realizada                           |
| resource          | TEXT      | Recurso afectado                           |
| details           | JSONB     | Detalles adicionales del evento            |
| created_at        | TIMESTAMP | Marca de tiempo del evento                 |

## Directrices de Desarrollo

### Dependencias Requeridas
```json
{
  "dependencies": {
    "@floating-ui/react": "^0.26.9",
    "@react-google-maps/api": "^2.19.3",
    "@react-pdf/renderer": "^4.3.0",
    "@supabase/supabase-js": "^2.39.7",
    "@types/date-fns": "^2.5.3",
    "@types/recharts": "^1.8.29",
    "chart.js": "^4.5.0",
    "chartjs-node-canvas": "^5.0.0",
    "date-fns": "^4.1.0",
    "file-saver": "^2.0.5",
    "html2canvas": "^1.4.1",
    "jspdf": "^3.0.0",
    "jspdf-autotable": "^5.0.2",
    "lucide-react": "^0.344.0",
    "pdfjs-dist": "^4.10.38",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.22.2",
    "recharts": "^3.1.2"
  },
  "devDependencies": {
    "@faker-js/faker": "^9.6.0",
    "@types/file-saver": "^2.0.7",
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@typescript-eslint/eslint-plugin": "^7.0.2",
    "@typescript-eslint/parser": "^7.0.2",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.4"
  }
}
```

### Configuración del Entorno
1. Se requiere Node.js 18+
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_de_supabase
   VITE_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key (requerido para administración de usuarios)
   VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key (opcional, para autocompletado de direcciones)
   ```
4. Iniciar servidor de desarrollo: `npm run dev`

### Estándares de Codificación
- Usar TypeScript para seguridad de tipos
- Seguir la configuración de ESLint
- Usar Prettier para formateo de código
- Seguir arquitectura basada en componentes
- Implementar manejo adecuado de errores
- Escribir pruebas exhaustivas (pendiente)

### Modo Desarrollo (Development Mode)
- **Activación**: Se puede activar/desactivar mediante el botón "DEV: ON/OFF" ubicado en la esquina inferior derecha de la aplicación.
- **Estado Persistente**: El estado del modo desarrollo se guarda en `localStorage` (`devMode: 'true'`) y es detectado por los servicios.
- **Credenciales de Acceso**: Usar `email: admin`, `password: 12345` para iniciar sesión en modo desarrollo.
- **Datos Falsos**: Cuando el modo desarrollo está activo:
    - El servicio de autenticación (`AuthService`) genera una sesión de usuario administrador falsa.
    - Los servicios de datos (`activities`, `games`, `stores`, `users`, `reports`) devuelven datos falsos generados con `faker-js` en lugar de llamar a Supabase.
    - Las operaciones de creación, actualización y eliminación son simuladas localmente (se muestra un log en la consola) sin afectar la base de datos real.
- **Utilidad**: Permite probar la interfaz de usuario y la lógica del frontend sin necesidad de una conexión real a la base de datos o autenticación válida. Útil para desarrollo offline o pruebas de UI aisladas.
- **Indicadores**: La página de Login muestra un indicador visual ("MODO DESARROLLO ACTIVO") y placeholders/tooltips para las credenciales de desarrollo cuando el modo está activo.

### Consideraciones de Seguridad
- Seguridad a nivel de fila (RLS) implementada en todas las tablas
- Variables de entorno para datos sensibles
- Cliente de Supabase con Service Role Key para operaciones administrativas
- Se requiere validación de entrada
- Verificaciones de autenticación implementadas
- Control de acceso basado en roles (Admin, Cliente, Usuario)
- Tabla de logs de seguridad para auditoría
- **Importante**: El modo desarrollo y sus credenciales solo deben estar disponibles en entornos de desarrollo, nunca en producción.
- **Importante**: La Service Role Key solo debe usarse en el backend o en operaciones administrativas controladas, nunca exponerse en el frontend público.

### Directrices de UI/UX
- Seguir mejores prácticas de accesibilidad (WCAG 2.1)
- Implementar patrones de diseño responsivo
- Usar manejo de errores y feedback consistentes
- Soportar navegación por teclado
- Mantener jerarquía visual
- Proporcionar feedback claro al usuario
- Implementar estados de carga
- Usar objetivos táctiles apropiados para móvil
- Mantener estilo de componentes consistente
- Priorizar recuperación de errores y contenido alternativo

### Consideraciones de Rendimiento
- Implementar carga diferida para rutas
- Optimizar tamaño del bundle
- Usar estrategias adecuadas de caché
- Implementar límites de error adecuados
- Monitorear y optimizar consultas de base de datos
- Usar optimización de imágenes adecuada
- Implementar gestión de estado adecuada
- Considerar renderizado del lado del servidor cuando sea necesario
- Optimizar generación de PDF para reportes grandes

## Actualizaciones Recientes

### Mejoras de UI
- Barra de navegación mejorada con botones más compactos y estilizados
- Mejora de feedback visual para elementos de navegación activos
- Reducción de tamaños de elementos de navegación para mejor utilización del espacio
- Aplicación de patrones de estilo consistentes en vistas móviles y de escritorio
- Integración con Google Maps para autocompletado de direcciones
- Componentes de gráficos mejorados con Recharts y Chart.js

### Mejoras del Sistema de Reportes
- Implementación de manejo robusto de errores en todo el proceso de generación de reportes
- Añadida validación exhaustiva para datos de entrada y contenido generado
- Mejora del formato de fechas con soporte adecuado de localización
- Mejora de la generación de contenido PDF con visualizaciones alternativas cuando los datos no están disponibles
- Corrección de problemas con la generación de gráficos y manejo de colores
- Añadida validación para archivos generados antes de la descarga
- Implementación de reportes mensuales, trimestrales, semestrales y anuales
- Guardado de reportes generados en base de datos
- Nuevos tipos de reportes: Historial, Búsquedas y Usuarios

### Nuevas Funcionalidades
- **Administración de Usuarios**: Panel completo para administradores con CRUD de usuarios, asignación de roles y cambio de contraseñas
- **Sistema de Analíticas**: Dashboard con métricas en tiempo real, análisis de tiendas, juegos y actividades más populares
- **Reportes Mensuales**: Generación de reportes periódicos con análisis de crecimiento y tendencias
- **Integración Google Maps**: Autocompletado de direcciones con validación geográfica
- **Sistema de Historial**: Registro de todas las interacciones de usuarios con actividades, tiendas y juegos
- **Logs de Seguridad**: Tabla dedicada para auditoría de acciones administrativas

### Mejoras de Base de Datos
- Actualización automática del campo `updated_at` mediante triggers en PostgreSQL
- Corrección de nombres de columnas para consistencia (snake_case)
- Mejora de relaciones entre tablas
- Implementación de índices para optimización de consultas
- **Nota**: El campo `updated_at` en la tabla `activities` se actualiza automáticamente mediante un trigger de PostgreSQL cuando se edita una actividad. El servicio `updateActivity` puede actualizar manualmente este campo si es necesario.

## Estructura del Proyecto

### Organización de Archivos

```
tcg-admin/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Charts/         # Componentes de gráficos
│   │   ├── Button.tsx
│   │   ├── Calendar.tsx
│   │   ├── DashboardAnalytics.tsx
│   │   ├── DevModeToggle.tsx
│   │   ├── ErrorScreen.tsx
│   │   ├── EventsModal.tsx
│   │   ├── Layout.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   ├── PlacesAutocomplete.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ReportAnalytics.tsx
│   │   ├── ReportGenerator.tsx
│   │   └── ...
│   ├── context/            # Contextos de React
│   │   ├── AuthContext.tsx
│   │   └── DevContext.tsx
│   ├── hooks/             # Custom hooks
│   │   ├── useFocusTrap.ts
│   │   ├── useLockBodyScroll.ts
│   │   ├── useOnClickOutside.ts
│   │   └── useUserProfile.ts
│   ├── lib/               # Utilidades y clientes
│   │   ├── devModeUtils.ts
│   │   ├── fakeData.ts
│   │   ├── googleMapsClient.ts
│   │   ├── supabaseAdmin.ts
│   │   ├── supabaseClient.ts
│   │   └── validation.ts
│   ├── pages/             # Páginas principales
│   │   ├── ActivitiesAdmin.tsx
│   │   ├── ActivityDetail.tsx
│   │   ├── Dashboard.tsx
│   │   ├── GamesAdmin.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── Signup.tsx
│   │   ├── StoresAdmin.tsx
│   │   └── UsersAdmin.tsx
│   ├── services/          # Servicios de datos
│   │   ├── activities.ts
│   │   ├── adminUsers.ts
│   │   ├── analytics.ts
│   │   ├── auth.ts
│   │   ├── games.ts
│   │   ├── monthlyReports.ts
│   │   ├── reports.ts
│   │   ├── security.ts
│   │   ├── stores.ts
│   │   └── users.ts
│   ├── types/             # Definiciones de tipos TypeScript
│   │   └── database.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── router.tsx
│   └── index.css
├── supabase/
│   └── migrations/        # Migraciones de base de datos
├── docs/                  # Documentación
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Servicios Principales

- **activities.ts**: Gestión completa de actividades (CRUD)
- **games.ts**: Gestión de juegos y relación con tiendas
- **stores.ts**: Gestión de tiendas
- **adminUsers.ts**: Administración de usuarios (solo Admin)
- **analytics.ts**: Servicio de analíticas y métricas
- **reports.ts**: Generación de reportes PDF
- **monthlyReports.ts**: Reportes periódicos (mensuales, trimestrales, etc.)
- **auth.ts**: Autenticación y gestión de sesiones
- **users.ts**: Gestión de perfiles de usuario
- **security.ts**: Logs de seguridad y auditoría

### Componentes Clave

- **Layout**: Layout principal con navegación
- **ProtectedRoute**: Protección de rutas basada en autenticación
- **DashboardAnalytics**: Visualización de métricas del dashboard
- **ReportGenerator**: Generador de reportes PDF
- **PlacesAutocomplete**: Autocompletado de direcciones con Google Maps
- **DevModeToggle**: Toggle para modo desarrollo

## Próximos Pasos

1. Prioridades Inmediatas
   - Reimplementar sistema de validación de formularios
   - Mejorar manejo de errores y estados de carga
   - Optimizar consultas de base de datos para mejor rendimiento
   - Refactorizar componentes grandes (ActivitiesAdmin.tsx excede 500 líneas)

2. Objetivos a Medio Plazo
   - Implementar sistema de suscripciones completo
   - Agregar operaciones por lotes
   - Expandir opciones de personalización de reportes
   - Implementar notificaciones en tiempo real
   - Mejorar sistema de búsqueda y filtrado

3. Objetivos a Largo Plazo
   - Implementar suite completa de pruebas (unitarias, integración, E2E)
   - Optimizar rendimiento y tamaño del bundle
   - Expandir características analíticas avanzadas
   - Desarrollar sistema de notificaciones push
   - Implementar sistema de caché para consultas frecuentes
   - Agregar soporte multi-idioma 

