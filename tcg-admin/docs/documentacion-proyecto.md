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

2. Framework UI Básico
   - Implementación de diseño responsivo
   - Tema de estilo retro con estética de pixel art
   - Biblioteca de componentes (Botón, Input, Modal, etc.)
   - Notificaciones Toast
   - Estados de carga
   - Navegación mejorada con botones compactos y estilizados

3. Esquema de Base de Datos
   - Todas las tablas principales creadas
   - Seguridad a nivel de fila (RLS) implementada
   - Relaciones básicas establecidas

4. Páginas Principales
   - Vista de Dashboard
   - Gestión de Actividades
   - Gestión de Juegos
   - Gestión de Tiendas
   - Perfil de usuario
   - Configuración
   - Página de Reportes con herramientas completas de exportación

5. Sistema de Exportación de Datos
   - Generación de reportes PDF
   - Múltiples tipos de reportes (Actividades, Juegos, Tiendas, Dashboard)
   - Parámetros de reportes personalizables
   - Filtrado por rango de fechas
   - Filtros específicos por tienda y juego
   - Visualización de datos con gráficos
   - Manejo robusto de errores

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
- Creación y gestión de eventos
- Sistema de registro para eventos
- Integración con calendario con interfaz visual
- Seguimiento de ubicación
- Asociación con juegos
- Asociación con tiendas
- Soporte para enlaces de referencia
- Seguimiento del estado de eventos

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
- Múltiples tipos de reportes (Actividades, Tiendas, Juegos, Dashboard)
- Capacidades avanzadas de filtrado
- Selección de rango de fechas para reportes basados en tiempo
- Filtrado específico por tienda y juego
- Visualización de métricas clave mediante gráficos
- Secciones de resumen ejecutivo
- Tablas detalladas de datos
- Análisis de tendencias
- Manejo robusto de errores y contenido alternativo
- Formato y estilo profesional

## Esquema de Base de Datos

### Visión General de Tablas

#### activities
| Columna           | Tipo      | Descripción                                |
|-------------------|-----------|-------------------------------------------|
| id_actividad      | UUID      | Clave primaria para identificación de actividad |
| id_tienda         | UUID      | Referencia a la tienda anfitriona         |
| id_juego          | UUID      | Referencia al juego destacado             |
| nombre            | TEXT      | Nombre/título de la actividad             |
| fecha             | TIMESTAMP | Fecha y hora del evento                   |
| ubicacion         | TEXT      | Ubicación del evento                      |
| enlace_referencia | TEXT      | Enlace de referencia/registro opcional    |
| created_st        | TIMESTAMP | Marca de tiempo de creación del registro  |
| updated_st        | TIMESTAMP | Marca de tiempo de última modificación    |

#### games
| Columna        | Tipo      | Descripción                                |
|---------------|-----------|-------------------------------------------|
| id_juego      | UUID      | Clave primaria para identificación de juego |
| nombre        | TEXT      | Nombre del juego                          |
| descripcion   | TEXT      | Descripción detallada del juego           |
| categorias    | VARCHAR   | Categoría del juego (Estrategia, TCG, etc.) |
| edad_minima   | INTEGER   | Edad mínima recomendada                   |
| edad_maxima   | INTEGER   | Edad máxima recomendada (opcional)        |
| jugadores_min | INTEGER   | Número mínimo de jugadores                |
| jugadores_max | INTEGER   | Número máximo de jugadores                |
| duracion_min  | INTEGER   | Tiempo mínimo de juego en minutos         |
| duracion_max  | INTEGER   | Tiempo máximo de juego en minutos         |
| created_st    | TIMESTAMP | Marca de tiempo de creación del registro  |
| updated_st    | TIMESTAMP | Marca de tiempo de última modificación    |

#### stores
| Columna     | Tipo      | Descripción                                |
|------------|-----------|-------------------------------------------|
| id_tienda  | UUID      | Clave primaria para identificación de tienda |
| nombre     | TEXT      | Nombre de la tienda                       |
| direccion  | JSONB     | Detalles de dirección de la tienda        |
| horario    | JSONB     | Horario de operación para cada día        |
| plan       | TEXT      | Tipo de plan de suscripción               |
| created_st | TIMESTAMP | Marca de tiempo de creación del registro  |
| updated_st | TIMESTAMP | Marca de tiempo de última modificación    |

#### store_games
| Columna     | Tipo      | Descripción                                |
|------------|-----------|-------------------------------------------|
| id_tienda  | UUID      | Referencia a tienda (clave primaria compuesta) |
| id_juego   | UUID      | Referencia a juego (clave primaria compuesta) |
| stock      | INTEGER   | Cantidad actual de stock                   |
| precio     | DECIMAL   | Precio actual                             |
| created_st | TIMESTAMP | Marca de tiempo de creación del registro  |

#### profiles
| Columna        | Tipo      | Descripción                                |
|---------------|-----------|-------------------------------------------|
| id            | UUID      | Clave primaria (enlaza a auth.users)      |
| nombre        | TEXT      | Nombre del usuario                        |
| apellido      | TEXT      | Apellido del usuario                      |
| ciudad        | TEXT      | Ciudad del usuario                        |
| comuna_region | TEXT      | Comuna/región del usuario                 |
| pais          | TEXT      | País del usuario                          |
| tipo_plan     | TEXT      | Plan de suscripción del usuario           |
| role          | ENUM      | Rol de usuario (usuario, cliente, admin)  |
| updated_st    | TIMESTAMP | Marca de tiempo de última modificación    |

#### inscriptions
| Columna         | Tipo      | Descripción                                |
|----------------|-----------|-------------------------------------------|
| id_usuario     | UUID      | Referencia al usuario (clave primaria compuesta) |
| id_actividad   | UUID      | Referencia a la actividad (clave primaria compuesta) |
| fecha_registro | TIMESTAMP | Marca de tiempo de registro               |

#### searches
| Columna          | Tipo      | Descripción                                |
|-----------------|-----------|-------------------------------------------|
| id_busqueda     | UUID      | Clave primaria para registro de búsqueda  |
| id_usuario      | UUID      | Referencia al usuario que busca           |
| tipo_busqueda   | TEXT      | Tipo/categoría de búsqueda                |
| termino_busqueda| TEXT      | Término de consulta de búsqueda           |
| fecha_hora      | TIMESTAMP | Marca de tiempo de búsqueda              |

#### reports
| Columna           | Tipo      | Descripción                                |
|------------------|-----------|-------------------------------------------|
| id_informe       | UUID      | Clave primaria para informe               |
| id_tienda        | UUID      | Referencia a tienda                       |
| tipo_informe     | TEXT      | Identificador del tipo de informe         |
| fecha_generacion | TIMESTAMP | Marca de tiempo de generación de informe  |
| parametros       | JSONB     | Parámetros y configuraciones del informe  |

## Directrices de Desarrollo

### Dependencias Requeridas
```json
{
  "dependencies": {
    "@floating-ui/react": "^0.26.9",
    "@supabase/supabase-js": "^2.39.7",
    "date-fns": "^2.30.0",
    "file-saver": "^2.0.5",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.22.2"
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
   ```
4. Iniciar servidor de desarrollo: `npm run dev`

### Estándares de Codificación
- Usar TypeScript para seguridad de tipos
- Seguir la configuración de ESLint
- Usar Prettier para formateo de código
- Seguir arquitectura basada en componentes
- Implementar manejo adecuado de errores
- Escribir pruebas exhaustivas (pendiente)

### Consideraciones de Seguridad
- Seguridad a nivel de fila (RLS) implementada
- Variables de entorno para datos sensibles
- Se requiere validación de entrada
- Verificaciones de autenticación implementadas
- Se necesitan auditorías de seguridad regulares

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

### Mejoras del Sistema de Reportes
- Implementación de manejo robusto de errores en todo el proceso de generación de reportes
- Añadida validación exhaustiva para datos de entrada y contenido generado
- Mejora del formato de fechas con soporte adecuado de localización
- Mejora de la generación de contenido PDF con visualizaciones alternativas cuando los datos no están disponibles
- Corrección de problemas con la generación de gráficos y manejo de colores
- Añadida validación para archivos generados antes de la descarga

## Próximos Pasos

1. Prioridades Inmediatas
   - Reimplementar sistema de validación de formularios
   - Completar implementación de análisis de actividades
   - Mejorar manejo de errores y estados de carga
   - Implementar permisos de usuarios

2. Objetivos a Medio Plazo
   - Implementar sistema de suscripciones
   - Agregar operaciones por lotes
   - Expandir opciones de personalización de reportes

3. Objetivos a Largo Plazo
   - Implementar suite completa de pruebas
   - Optimizar rendimiento
   - Expandir características analíticas
   - Desarrollar sistema de notificaciones 