import { Database } from './supabase';

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
}

export interface ActivityInput {
  id_tienda?: string;
  id_juego?: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  enlace_referencia?: string;
}

export interface Direccion {
  calle: string;
  numero: string;
  ciudad: string;
  estado: string;
  cp: string;
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
  updated_at: string;
}