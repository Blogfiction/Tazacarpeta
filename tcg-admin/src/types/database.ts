export interface Game {
  id_game: string;
  name: string;
  description: string;
  category: string;
  min_age: number;
  max_age: number | null;
  min_players: number;
  max_players: number;
  min_duration: number;
  max_duration: number;
  created_at: string;
  updated_at: string;
}

export interface GameInput {
  name: string;
  description: string;
  category: string;
  min_age: number;
  max_age?: number | null;
  min_players: number;
  max_players: number;
  min_duration: number;
  max_duration: number;
}

export interface Activity {
  id_activity: string;
  id_store: string | null;
  id_game: string | null;
  date: string;
  reference_link: string | null;
  created_at: string;
  updated_at: string;
  id_place?: string;
}

export interface ActivityInput {
  id_store?: string;
  id_game?: string;
  date: string;
  reference_link?: string;
  id_place?: string;
}

export interface Direccion {
  calle: string;
  numero: string;
  ciudad: string;
  estado: string;
  cp: string;
  place_id?: string;
  lat?: number;
  lng?: number;
}

export interface HorarioTienda {
  [key: string]: {
    apertura: string;
    cierre: string;
  };
}

export interface Store {
  id_store: string;
  name_store: string;
  adress: string;
  phone: number | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface StoreInput {
  name_store: string;
  adress: string;
  phone?: number;
  email?: string;
  latitude?: number;
  longitude?: number;
}

export interface Profile {
  id: string;
  nombre: string | null;
  apellido: string | null;
  ciudad: string | null;
  comuna_region: string | null;
  pais: string | null;
  tipo_plan: string;
  email: string | null;
  updated_at: string;
}

export interface UserActivityStats {
  id: string;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  total_inscriptions: number;
  total_searches: number;
  last_activity: string | null;
}

export interface StoreGame {
  id_tienda: string;
  id_juego: string;
  stock: number;
  precio: number;
  created_at: string;
}

export interface StoreGameInput {
  id_tienda: string;
  id_juego: string;
  stock: number;
  precio: number;
}

// Added Report type based on documentation
export interface Report {
  id_informe: string;
  id_tienda: string | null; // Allow null if report is not store-specific
  tipo_informe: string;
  fecha_generacion: string;
  parametros: { [key: string]: any }; // Use a flexible type for parameters
}