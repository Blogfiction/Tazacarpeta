# TCG Admin - Project Documentation

## System Overview

TCG Admin is a comprehensive management system designed for trading card game stores and events. The system provides tools for managing inventory, organizing events, and tracking store activities.

## Core Features

### 1. Authentication System
- Email-based authentication
- User profile management
- Role-based access control
- Session management

### 2. Game Management
- CRUD operations for games
- Categorization system
- Age and player count restrictions
- Duration tracking
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
- Store profile management
- Operating hours configuration
- Location management
- Inventory tracking
- Multiple store support

### 4. Activity Management
- Event creation and management
- Event registration
- Calendar integration
- Location tracking
- Game association

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

### Relationships and Constraints

#### Primary Relationships
1. Activity Relationships
   - activities.id_tienda → stores.id_tienda
   - activities.id_juego → games.id_juego

2. Store Relationships
   - store_games.id_tienda → stores.id_tienda
   - store_games.id_juego → games.id_juego
   - reports.id_tienda → stores.id_tienda

3. User Relationships
   - profiles.id → auth.users.id
   - inscriptions.id_usuario → profiles.id
   - inscriptions.id_actividad → activities.id_actividad
   - searches.id_usuario → profiles.id

#### Cascade Behaviors
1. Store Deletion
   - Cascades to: activities, store_games, reports
   - All related records are automatically deleted

2. Game Deletion
   - Cascades to: activities, store_games
   - All related records are automatically deleted

3. User Deletion
   - Cascades to: profile, inscriptions, searches
   - All related records are automatically deleted

## API Endpoints

### Authentication
- POST /auth/signup
- POST /auth/login
- POST /auth/logout
- GET /auth/user

### Games
- GET /games
- GET /games/:id
- POST /games
- PUT /games/:id
- DELETE /games/:id

### Stores
- GET /stores
- GET /stores/:id
- POST /stores
- PUT /stores/:id
- DELETE /stores/:id

### Activities
- GET /activities
- GET /activities/:id
- POST /activities
- PUT /activities/:id
- DELETE /activities/:id

## Development Guidelines

### Required Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.7",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
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
- Write comprehensive tests

### Security Considerations
- Implement Row Level Security (RLS)
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper authentication checks
- Regular security audits
