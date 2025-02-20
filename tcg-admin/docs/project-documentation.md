# TCG Admin - Project Documentation

## System Overview

TCG Admin is a comprehensive management system designed for trading card game stores and events. The system provides tools for managing inventory, organizing events, and tracking store activities.

## Implementation Status

### Completed Features ✅

1. Authentication System
   - Email-based authentication with Supabase
   - User profile management
   - Session handling
   - Login/Signup flows

2. Basic UI Framework
   - Responsive design implementation
   - Retro-styled theme with pixel art aesthetics
   - Component library (Button, Input, Modal, etc.)
   - Toast notifications
   - Loading states

3. Database Schema
   - All core tables created
   - Row Level Security (RLS) implemented
   - Basic relationships established

4. Core Pages
   - Dashboard view
   - Activities management
   - Games management
   - Stores management
   - User profile
   - Settings

### In Progress 🚧

1. Data Management
   - Store inventory tracking
   - Event registration system
   - Activity analytics

2. User Experience
   - Form validations (needs reimplementation)
   - Error handling improvements
   - Loading state optimizations

### Pending Features ⏳

1. Advanced Features
   - Subscription plan implementation
   - Advanced analytics
   - Export functionality
   - Batch operations

2. Performance Optimizations
   - Query optimization
   - Caching implementation
   - Asset optimization

3. Testing
   - Unit tests
   - Integration tests
   - End-to-end tests

## Core Features

### 1. Authentication System
- Email-based authentication with Supabase
- User profile management with customizable fields
- Role-based access control
- Secure session management
- Password recovery and update functionality

### 2. Game Management
- CRUD operations for games
- Advanced filtering and search capabilities
- Categorization system with predefined categories
- Age and player count restrictions
- Duration tracking
- Stock and pricing management per store
- Categories:
  - Strategy
  - Family
  - Party
  - Role-Playing
  - Deck Building
  - Wargame
  - TCG (Trading Card Games)
  - Others

### 3. Store Management
- Store profile management with detailed information
- Operating hours configuration with flexible scheduling
- Location management with address validation
- Inventory tracking with real-time updates
- Multiple store support
- Game inventory management per store
- Subscription plan management (Basic, Premium, Enterprise)

### 4. Activity Management
- Event creation and management
- Event registration system
- Calendar integration with visual interface
- Location tracking
- Game association
- Store association
- Reference link support
- Event status tracking

### 5. User Interface
- Responsive design for all devices
- Retro-styled theme with pixel art aesthetics
- Accessibility features (ARIA, keyboard navigation)
- Toast notifications for user feedback
- Modal dialogs for complex interactions
- Interactive tooltips for help text
- Loading states and error handling

## Database Schema

### Tables Overview

#### activities
| Column            | Type      | Description                                |
|-------------------|-----------|-------------------------------------------|
| id_actividad      | UUID      | Primary key for activity identification   |
| id_tienda         | UUID      | Reference to hosting store                |
| id_juego          | UUID      | Reference to featured game                |
| nombre            | TEXT      | Activity name/title                       |
| fecha             | TIMESTAMP | Event date and time                       |
| ubicacion         | TEXT      | Event location                           |
| enlace_referencia | TEXT      | Optional reference/registration link      |
| created_st        | TIMESTAMP | Record creation timestamp                 |
| updated_st        | TIMESTAMP | Last modification timestamp              |

#### games
| Column        | Type      | Description                                |
|---------------|-----------|-------------------------------------------|
| id_juego      | UUID      | Primary key for game identification       |
| nombre        | TEXT      | Game name                                 |
| descripcion   | TEXT      | Detailed game description                 |
| categorias    | VARCHAR   | Game category (Strategy, TCG, etc.)       |
| edad_minima   | INTEGER   | Minimum recommended age                   |
| edad_maxima   | INTEGER   | Maximum recommended age (optional)        |
| jugadores_min | INTEGER   | Minimum number of players                 |
| jugadores_max | INTEGER   | Maximum number of players                 |
| duracion_min  | INTEGER   | Minimum play time in minutes              |
| duracion_max  | INTEGER   | Maximum play time in minutes              |
| created_st    | TIMESTAMP | Record creation timestamp                 |
| updated_st    | TIMESTAMP | Last modification timestamp              |

#### stores
| Column     | Type      | Description                                |
|------------|-----------|-------------------------------------------|
| id_tienda  | UUID      | Primary key for store identification      |
| nombre     | TEXT      | Store name                                |
| direccion  | JSONB     | Store address details                     |
| horario    | JSONB     | Operating hours for each day              |
| plan       | TEXT      | Subscription plan type                    |
| created_st | TIMESTAMP | Record creation timestamp                 |
| updated_st | TIMESTAMP | Last modification timestamp              |

#### store_games
| Column     | Type      | Description                                |
|------------|-----------|-------------------------------------------|
| id_tienda  | UUID      | Store reference (composite primary key)    |
| id_juego   | UUID      | Game reference (composite primary key)     |
| stock      | INTEGER   | Current stock quantity                     |
| precio     | DECIMAL   | Current price                             |
| created_st | TIMESTAMP | Record creation timestamp                 |

#### profiles
| Column        | Type      | Description                                |
|---------------|-----------|-------------------------------------------|
| id            | UUID      | Primary key (links to auth.users)         |
| nombre        | TEXT      | User's first name                         |
| apellido      | TEXT      | User's last name                          |
| ciudad        | TEXT      | User's city                               |
| comuna_region | TEXT      | User's commune/region                     |
| pais          | TEXT      | User's country                            |
| tipo_plan     | TEXT      | User's subscription plan                  |
| role          | ENUM      | User role (usuario, cliente, admin)       |
| updated_st    | TIMESTAMP | Last modification timestamp              |

#### inscriptions
| Column         | Type      | Description                                |
|----------------|-----------|-------------------------------------------|
| id_usuario     | UUID      | User reference (composite primary key)     |
| id_actividad   | UUID      | Activity reference (composite primary key) |
| fecha_registro | TIMESTAMP | Registration timestamp                    |

#### searches
| Column          | Type      | Description                                |
|-----------------|-----------|-------------------------------------------|
| id_busqueda     | UUID      | Primary key for search record             |
| id_usuario      | UUID      | Reference to searching user               |
| tipo_busqueda   | TEXT      | Search category/type                      |
| termino_busqueda| TEXT      | Search query term                         |
| fecha_hora      | TIMESTAMP | Search timestamp                         |

#### reports
| Column           | Type      | Description                                |
|------------------|-----------|-------------------------------------------|
| id_informe       | UUID      | Primary key for report                    |
| id_tienda        | UUID      | Store reference                           |
| tipo_informe     | TEXT      | Report type identifier                    |
| fecha_generacion | TIMESTAMP | Report generation timestamp              |
| parametros       | JSONB     | Report parameters and settings            |

## Development Guidelines

### Required Dependencies
```json
{
  "dependencies": {
    "@floating-ui/react": "^0.26.9",
    "@supabase/supabase-js": "^2.39.7",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.22.2"
  }
}
```

### Environment Setup
1. Node.js 18+ required
2. Install dependencies: `npm install`
3. Configure environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Start development server: `npm run dev`

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Follow component-based architecture
- Implement proper error handling
- Write comprehensive tests (pending)

### Security Considerations
- Row Level Security (RLS) implemented
- Environment variables for sensitive data
- Input validation required
- Authentication checks implemented
- Regular security audits needed

### UI/UX Guidelines
- Follow accessibility best practices (WCAG 2.1)
- Implement responsive design patterns
- Use consistent error handling and user feedback
- Support keyboard navigation
- Maintain visual hierarchy
- Provide clear user feedback
- Implement loading states
- Use appropriate touch targets for mobile

### Performance Considerations
- Implement lazy loading for routes
- Optimize bundle size
- Use proper caching strategies
- Implement proper error boundaries
- Monitor and optimize database queries
- Use appropriate image optimization
- Implement proper state management
- Consider server-side rendering when needed

## Next Steps

1. Immediate Priorities
   - Reimplementar sistema de validación de formularios
   - Completar implementación de análisis de actividades
   - Mejorar manejo de errores y estados de carga

2. Medium-term Goals
   - Implementar sistema de suscripciones
   - Desarrollar funcionalidades de exportación
   - Agregar operaciones por lotes

3. Long-term Objectives
   - Implementar suite completa de pruebas
   - Optimizar rendimiento
   - Expandir características analíticas