import { faker } from '@faker-js/faker/locale/es_MX';
import type { Session, User } from '@supabase/supabase-js';
import type { Game, Store, Activity, StoreGame, Profile, Report, Direccion, HorarioTienda } from '../types/database';

// --- Thematic Data ---

const tcgNames = [
  'Magic: The Gathering', 'Pokémon TCG', 'Yu-Gi-Oh!', 'Lorcana', 'Flesh and Blood', 
  'Cardfight!! Vanguard', 'Digimon Card Game', 'One Piece Card Game', 'Weiss Schwarz'
];
const boardGameNames = [
  'Catan', 'Ticket to Ride', 'Gloomhaven', 'Pandemic', 'Wingspan', 'Terraforming Mars',
  'Azul', '7 Wonders', 'Carcassonne', 'Everdell', 'Root', 'Scythe'
];
const gameNameTemplates = [
  (name: string) => `${name}: Booster Box`,
  (name: string) => `${name}: Starter Deck`,
  (name: string) => `${name} Singles`,
  (name: string) => `${name} Expansion Pack`,
  (name: string) => name, // Just the board game name
];

const storeNamePrefixes = ['La Guarida del', 'El Reino de', 'El Portal de', 'La Torre de', 'El Bazar de', 'Zona'];
const storeNameSuffixes = ['Dragón', 'Mago', 'Héroe', 'Gremio', 'Dados', 'Cartas', 'Juegos', 'Meeple'];
const storeNameExtras = ['TCG', 'Juegos', 'Hobbies', 'Collectibles'];

const activityTypes = ['Torneo', 'Liga', 'Noche de Juegos', 'Demo Day', 'Draft', 'Sellado', 'Presentación', 'Juego Libre'];
const activityFormats = ['Modern', 'Standard', 'Commander', 'Pioneer', 'Pauper', 'Libre', 'Principiantes'];

// --- User & Profile --- 

export const createFakeUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  role: 'authenticated', // Default role in Supabase Auth User
  aud: 'authenticated',
  app_metadata: { provider: 'email' },
  user_metadata: {
    name: faker.person.fullName(),
    avatar_url: faker.image.avatarGitHub(), // Example custom metadata
  },
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
});

export const createFakeProfile = (userId: string, email: string, overrides: Partial<Profile> = {}): Profile => ({
  id: userId,
  nombre: faker.person.firstName(),
  apellido: faker.person.lastName(),
  ciudad: faker.location.city(),
  comuna_region: faker.location.state(), // Maps to comuna_region
  pais: 'Chile', // Example default
  tipo_plan: faker.helpers.arrayElement(['Básico', 'Premium', 'Enterprise']),
  email: email, // Add email field
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
});

export const createFakeAdminUser = (): User => {
  const userId = 'dev-admin-user-' + faker.string.uuid();
  return createFakeUser({
    id: userId,
    email: 'admin@dev.local',
    // role: 'admin', // Role is not directly on Supabase User, might be in app_metadata or a separate table
    user_metadata: {
      name: 'Developer Admin',
      avatar_url: faker.image.avatarGitHub()
    }
  });
};

export const createFakeAdminProfile = (userId: string, email: string): Profile => createFakeProfile(userId, email, {
  // role: 'admin', // Role is not in Profile type
  tipo_plan: 'Enterprise',
  nombre: 'Admin',
  apellido: 'Developer',
});

export const createFakeSession = (user: User): Session => ({
  access_token: faker.string.alphanumeric(60),
  refresh_token: faker.string.alphanumeric(60),
  expires_in: 3600,
  token_type: 'bearer',
  user: user,
});

// --- Game --- 

const gameCategories = ['Estrategia', 'Familia', 'Fiesta', 'Rol', 'Construcción de mazos', 'Wargame', 'TCG', 'Cooperativo', 'Eurogame', 'Ameritrash', 'Abstracto', 'Otros'];

export const createFakeGame = (overrides: Partial<Game> = {}): Game => {
  const isTCG = Math.random() > 0.4; // 60% TCGs
  const baseName = isTCG ? faker.helpers.arrayElement(tcgNames) : faker.helpers.arrayElement(boardGameNames);
  const nameTemplate = faker.helpers.arrayElement(gameNameTemplates);
  const nombre = isTCG ? nameTemplate(baseName) : baseName; // Apply template only for TCGs sometimes
  const categoria = isTCG ? 'TCG' : faker.helpers.arrayElement(gameCategories.filter(c => c !== 'TCG'));

  const jugadores_min = isTCG ? 2 : faker.number.int({ min: 1, max: 4 });
  const jugadores_max = isTCG ? 2 : faker.number.int({ min: jugadores_min + 1, max: 8 });
  const duracion_min = isTCG ? faker.helpers.arrayElement([20, 30, 45]) : faker.helpers.arrayElement([30, 45, 60, 90]);
  const duracion_max = isTCG ? faker.helpers.arrayElement([45, 60, 90]) : faker.helpers.arrayElement([60, 90, 120, 180, 240]);


  return {
    id_juego: faker.string.uuid(),
    nombre: nombre,
    descripcion: faker.lorem.sentence({ min: 5, max: 15 }), // Shorter description
    categoria: categoria,
    edad_minima: faker.number.int({ min: 6, max: 16 }),
    edad_maxima: faker.helpers.maybe(() => faker.number.int({ min: 18, max: 99 }), { probability: 0.2 }) ?? null,
    jugadores_min: jugadores_min,
    jugadores_max: jugadores_max,
    duracion_min: duracion_min,
    duracion_max: duracion_max,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
};

export const createFakeGames = (count: number): Game[] => 
  Array.from({ length: count }, () => createFakeGame());

// --- Store --- 

const createFakeDireccion = (): Direccion => ({
  calle: faker.location.street(),
  numero: faker.location.buildingNumber(),
  ciudad: faker.location.city(),
  estado: faker.location.state(),
  cp: faker.location.zipCode(),
  place_id: faker.string.uuid(),
  lat: faker.location.latitude({ max: -33, min: -34 }), // Example range for Chile, returns number
  lng: faker.location.longitude({ max: -70, min: -71 }), // Example range for Chile, returns number
});

const createFakeHorario = (): HorarioTienda => ({
  lunes: { apertura: '09:00', cierre: '18:00' },
  martes: { apertura: '09:00', cierre: '18:00' },
  miercoles: { apertura: '09:00', cierre: '18:00' },
  jueves: { apertura: '09:00', cierre: '18:00' },
  viernes: { apertura: '09:00', cierre: '20:00' },
  sabado: { apertura: '10:00', cierre: '16:00' },
  domingo: { apertura: 'Cerrado', cierre: 'Cerrado' }, // Or handle closed days differently
});

export const createFakeStore = (overrides: Partial<Store> = {}): Store => {
  const nombre = `${faker.helpers.arrayElement(storeNamePrefixes)} ${faker.helpers.arrayElement(storeNameSuffixes)} ${faker.helpers.maybe(() => faker.helpers.arrayElement(storeNameExtras), { probability: 0.5 }) ?? ''}`.trim();

  return {
    id_tienda: faker.string.uuid(),
    nombre: nombre,
    direccion: createFakeDireccion(),
    horario: createFakeHorario(),
    plan: faker.helpers.arrayElement(['Básico', 'Premium', 'Enterprise']),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
};

export const createFakeStores = (count: number): Store[] =>
  Array.from({ length: count }, () => createFakeStore());

// --- StoreGame (Inventory) --- 

export const createFakeStoreGame = (storeId: string, gameId: string, overrides: Partial<StoreGame> = {}): StoreGame => ({
  id_tienda: storeId,
  id_juego: gameId,
  stock: faker.number.int({ min: 0, max: 100 }),
  precio: parseFloat(faker.commerce.price({ min: 5000, max: 50000, dec: 0 })),
  created_at: faker.date.past().toISOString(),
  ...overrides,
});

export const createFakeStoreInventory = (storeId: string, games: Game[]): StoreGame[] => 
  games.map(game => createFakeStoreGame(storeId, game.id_juego));

// --- Activity --- 

export const createFakeActivity = (storeId: string | null, gameId: string | null, gameName: string | null, isTCG: boolean, overrides: Partial<Activity> = {}): Activity => {
  const activityType = faker.helpers.arrayElement(activityTypes);
  const gameSpecificName = gameName ?? faker.commerce.productName(); // Fallback if no game linked
  
  let nombre = `${activityType} de ${gameSpecificName}`;
  if (isTCG && Math.random() > 0.4) {
    const format = faker.helpers.arrayElement(activityFormats);
    nombre = `${activityType} ${format} - ${gameSpecificName.split(':')[0]}`; // Use base TCG name
  } else if (!isTCG && activityType === 'Noche de Juegos') {
     nombre = `${activityType} de Mesa`;
  } else if (activityType === 'Presentación') {
     nombre = `${activityType}: ${gameSpecificName}`;
  }

  return {
    id_actividad: faker.string.uuid(),
    id_tienda: storeId,
    id_juego: gameId,
    nombre: nombre,
    fecha: faker.date.between({ from: new Date(Date.now() - 365*24*60*60*1000), to: new Date(Date.now() + 365*24*60*60*1000) }).toISOString(),
    ubicacion: faker.location.streetAddress(), // Could link to store address if storeId provided
    enlace_referencia: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.7 }) ?? null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    place_id: faker.string.uuid(), // Maybe link to store's place_id
    lat: faker.location.latitude({ max: -33, min: -34 }), 
    lng: faker.location.longitude({ max: -70, min: -71 }), 
    ...overrides,
  };
};

export const createFakeActivities = (count: number, stores: Store[], games: Game[]): Activity[] => 
  Array.from({ length: count }, () => {
    const store = faker.helpers.maybe(() => faker.helpers.arrayElement(stores), { probability: 0.8 });
    const game = faker.helpers.maybe(() => faker.helpers.arrayElement(games), { probability: 0.9 });
    const isTCG = game?.categoria === 'TCG';
    return createFakeActivity(store?.id_tienda ?? null, game?.id_juego ?? null, game?.nombre ?? null, isTCG ?? false);
  });

// --- Report --- 

const reportTypes = ['Actividades', 'Tiendas', 'Juegos', 'Dashboard'];

export const createFakeReport = (storeId: string | null, overrides: Partial<Report> = {}): Report => ({
  id_informe: faker.string.uuid(),
  id_tienda: storeId, // Allow null
  tipo_informe: faker.helpers.arrayElement(reportTypes),
  fecha_generacion: faker.date.recent().toISOString(),
  parametros: {
    rangoFechas: {
      inicio: faker.date.past().toISOString(),
      fin: faker.date.recent().toISOString(),
    },
    filtros: faker.helpers.maybe(() => ({ 
      juegoId: faker.string.uuid(),
      tiendaId: storeId, // Include storeId if available 
    }), { probability: 0.3 }),
    generatedBy: 'fakeDataModule'
  },
  ...overrides,
});

export const createFakeReports = (count: number, stores: Store[]): Report[] => 
  Array.from({ length: count }, () => {
    const store = faker.helpers.maybe(() => faker.helpers.arrayElement(stores), {probability: 0.7});
    return createFakeReport(store ? store.id_tienda : null);
  }); 