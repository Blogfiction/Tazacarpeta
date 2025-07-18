export interface Game {
  id_juego: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  edad_minima: number;
  edad_maxima: number | null;
  jugadores_min: number;
  jugadores_max: number;
  duracion_min: number;
  duracion_max: number;
  created_at: string;
  updated_at: string;
}

export interface GameInput {
  nombre: string;
  descripcion: string;
  categoria: string;
  edad_minima: number;
  edad_maxima?: number | null;
  jugadores_min: number;
  jugadores_max: number;
  duracion_min: number;
  duracion_max: number;
}

export interface Activity {
  id_actividad: string;
  id_tienda: string | null;
  id_juego: string | null;
  nombre: string;
  fecha: string;
  ubicacion: string;
  enlace_referencia: string | null;
  created_at: string;
  updated_at: string;
  place_id?: string;
  lat?: number;
  lng?: number;
}

export interface ActivityInput {
  id_tienda?: string;
  id_juego?: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  enlace_referencia?: string;
  place_id?: string;
  lat?: number;
  lng?: number;
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
  id_tienda: string;
  nombre: string;
  direccion: Direccion;
  horario: HorarioTienda;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface StoreInput {
  nombre: string;
  direccion: Direccion;
  horario: HorarioTienda;
  plan: string;
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