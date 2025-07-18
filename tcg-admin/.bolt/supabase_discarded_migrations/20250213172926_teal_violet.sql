/*
  # Test Data Population

  1. Test Data Overview
    - Creates sample users and profiles
    - Adds games across different categories
    - Creates stores in different locations
    - Generates activities and events
    - Creates inscriptions and searches
    - Adds store-game relationships

  2. Data Characteristics
    - Realistic names and locations
    - Varied timestamps and dates
    - Interconnected relationships
    - Diverse categories and types
*/

-- Insert test users (using auth.users)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES
  ('d7bed82c-5f89-4d6e-89c9-e88e1b29bd6e', 'juan.perez@example.com', crypt('password123', gen_salt('bf')), now()),
  ('b9c9d82c-5f89-4d6e-89c9-e88e1b29bd6f', 'maria.garcia@example.com', crypt('password123', gen_salt('bf')), now()),
  ('a8b8d82c-5f89-4d6e-89c9-e88e1b29bd6g', 'carlos.rodriguez@example.com', crypt('password123', gen_salt('bf')), now()),
  ('c6b6d82c-5f89-4d6e-89c9-e88e1b29bd6h', 'ana.martinez@example.com', crypt('password123', gen_salt('bf')), now()),
  ('e5b5d82c-5f89-4d6e-89c9-e88e1b29bd6i', 'pedro.sanchez@example.com', crypt('password123', gen_salt('bf')), now());

-- Update profiles with test data
UPDATE profiles
SET 
  nombre = 'Juan',
  apellido = 'Pérez',
  ciudad = 'Santiago',
  comuna_region = 'Providencia',
  pais = 'Chile',
  email = 'juan.perez@example.com'
WHERE id = 'd7bed82c-5f89-4d6e-89c9-e88e1b29bd6e';

UPDATE profiles
SET 
  nombre = 'María',
  apellido = 'García',
  ciudad = 'Santiago',
  comuna_region = 'Las Condes',
  pais = 'Chile',
  email = 'maria.garcia@example.com'
WHERE id = 'b9c9d82c-5f89-4d6e-89c9-e88e1b29bd6f';

UPDATE profiles
SET 
  nombre = 'Carlos',
  apellido = 'Rodríguez',
  ciudad = 'Santiago',
  comuna_region = 'Ñuñoa',
  pais = 'Chile',
  email = 'carlos.rodriguez@example.com'
WHERE id = 'a8b8d82c-5f89-4d6e-89c9-e88e1b29bd6g';

UPDATE profiles
SET 
  nombre = 'Ana',
  apellido = 'Martínez',
  ciudad = 'Santiago',
  comuna_region = 'Santiago Centro',
  pais = 'Chile',
  email = 'ana.martinez@example.com'
WHERE id = 'c6b6d82c-5f89-4d6e-89c9-e88e1b29bd6h';

UPDATE profiles
SET 
  nombre = 'Pedro',
  apellido = 'Sánchez',
  ciudad = 'Santiago',
  comuna_region = 'La Florida',
  pais = 'Chile',
  email = 'pedro.sanchez@example.com'
WHERE id = 'e5b5d82c-5f89-4d6e-89c9-e88e1b29bd6i';

-- Insert test games
INSERT INTO games (id_juego, nombre, descripcion, categoria, edad_minima, edad_maxima, jugadores_min, jugadores_max, duracion_min, duracion_max)
VALUES
  ('f1234567-e89b-12d3-a456-426614174000', 'Magic: The Gathering', 'El juego de cartas coleccionables más popular', 'TCG', 13, null, 2, 2, 20, 40),
  ('f2345678-e89b-12d3-a456-426614174001', 'Pokémon TCG', 'Juego de cartas coleccionables de Pokémon', 'TCG', 6, null, 2, 2, 20, 30),
  ('f3456789-e89b-12d3-a456-426614174002', 'Yu-Gi-Oh!', 'Juego de cartas basado en el anime', 'TCG', 8, null, 2, 2, 15, 30),
  ('f4567890-e89b-12d3-a456-426614174003', 'Dragon Ball Super Card Game', 'TCG basado en Dragon Ball', 'TCG', 10, null, 2, 2, 20, 40),
  ('f5678901-e89b-12d3-a456-426614174004', 'Flesh and Blood', 'Nuevo TCG de fantasía', 'TCG', 14, null, 2, 2, 30, 45);

-- Insert test stores
INSERT INTO stores (id_tienda, nombre, direccion, horario, plan)
VALUES
  ('s1234567-e89b-12d3-a456-426614174000', 'Gamer''s Haven', 
   '{"calle": "Av. Providencia", "numero": "1234", "ciudad": "Santiago", "estado": "RM", "cp": "7500000"}',
   '{"lunes": {"apertura": "10:00", "cierre": "20:00"}, "martes": {"apertura": "10:00", "cierre": "20:00"}, "miercoles": {"apertura": "10:00", "cierre": "20:00"}, "jueves": {"apertura": "10:00", "cierre": "20:00"}, "viernes": {"apertura": "10:00", "cierre": "22:00"}, "sabado": {"apertura": "11:00", "cierre": "22:00"}, "domingo": {"apertura": "11:00", "cierre": "18:00"}}',
   'premium'),
  
  ('s2345678-e89b-12d3-a456-426614174001', 'Card Masters', 
   '{"calle": "Av. Las Condes", "numero": "5678", "ciudad": "Santiago", "estado": "RM", "cp": "7550000"}',
   '{"lunes": {"apertura": "11:00", "cierre": "21:00"}, "martes": {"apertura": "11:00", "cierre": "21:00"}, "miercoles": {"apertura": "11:00", "cierre": "21:00"}, "jueves": {"apertura": "11:00", "cierre": "21:00"}, "viernes": {"apertura": "11:00", "cierre": "23:00"}, "sabado": {"apertura": "12:00", "cierre": "23:00"}, "domingo": {"apertura": "12:00", "cierre": "19:00"}}',
   'enterprise'),
   
  ('s3456789-e89b-12d3-a456-426614174002', 'TCG World', 
   '{"calle": "Av. Irarrázaval", "numero": "9012", "ciudad": "Santiago", "estado": "RM", "cp": "7500000"}',
   '{"lunes": {"apertura": "12:00", "cierre": "20:00"}, "martes": {"apertura": "12:00", "cierre": "20:00"}, "miercoles": {"apertura": "12:00", "cierre": "20:00"}, "jueves": {"apertura": "12:00", "cierre": "20:00"}, "viernes": {"apertura": "12:00", "cierre": "22:00"}, "sabado": {"apertura": "12:00", "cierre": "22:00"}, "domingo": {"apertura": "12:00", "cierre": "18:00"}}',
   'básico');

-- Insert store_games relationships
INSERT INTO store_games (id_tienda, id_juego, stock, precio)
VALUES
  ('s1234567-e89b-12d3-a456-426614174000', 'f1234567-e89b-12d3-a456-426614174000', 50, 5000),
  ('s1234567-e89b-12d3-a456-426614174000', 'f2345678-e89b-12d3-a456-426614174001', 40, 4500),
  ('s1234567-e89b-12d3-a456-426614174000', 'f3456789-e89b-12d3-a456-426614174002', 30, 4000),
  ('s2345678-e89b-12d3-a456-426614174001', 'f1234567-e89b-12d3-a456-426614174000', 45, 5200),
  ('s2345678-e89b-12d3-a456-426614174001', 'f4567890-e89b-12d3-a456-426614174003', 35, 4800),
  ('s3456789-e89b-12d3-a456-426614174002', 'f5678901-e89b-12d3-a456-426614174004', 25, 6000);

-- Insert activities (some past, some future)
INSERT INTO activities (id_actividad, id_tienda, id_juego, nombre, fecha, ubicacion, enlace_referencia)
VALUES
  ('a1234567-e89b-12d3-a456-426614174000', 's1234567-e89b-12d3-a456-426614174000', 'f1234567-e89b-12d3-a456-426614174000',
   'Torneo Magic Standard', CURRENT_TIMESTAMP + INTERVAL '7 days', 'Sala Principal', 'https://example.com/torneo-magic'),
   
  ('a2345678-e89b-12d3-a456-426614174001', 's2345678-e89b-12d3-a456-426614174001', 'f2345678-e89b-12d3-a456-426614174001',
   'Pokémon League', CURRENT_TIMESTAMP + INTERVAL '14 days', 'Área de Juegos', 'https://example.com/pokemon-league'),
   
  ('a3456789-e89b-12d3-a456-426614174002', 's3456789-e89b-12d3-a456-426614174002', 'f3456789-e89b-12d3-a456-426614174002',
   'Yu-Gi-Oh! Championship', CURRENT_TIMESTAMP + INTERVAL '21 days', 'Salón VIP', 'https://example.com/yugioh-championship'),
   
  ('a4567890-e89b-12d3-a456-426614174003', 's1234567-e89b-12d3-a456-426614174000', 'f4567890-e89b-12d3-a456-426614174003',
   'Dragon Ball Super Showdown', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Sala Principal', 'https://example.com/dbs-showdown'),
   
  ('a5678901-e89b-12d3-a456-426614174004', 's2345678-e89b-12d3-a456-426614174001', 'f5678901-e89b-12d3-a456-426614174004',
   'Flesh and Blood Demo Day', CURRENT_TIMESTAMP - INTERVAL '14 days', 'Área de Juegos', 'https://example.com/fab-demo');

-- Insert inscriptions
INSERT INTO inscriptions (id_usuario, id_actividad, fecha_registro)
VALUES
  ('d7bed82c-5f89-4d6e-89c9-e88e1b29bd6e', 'a1234567-e89b-12d3-a456-426614174000', CURRENT_TIMESTAMP - INTERVAL '3 days'),
  ('b9c9d82c-5f89-4d6e-89c9-e88e1b29bd6f', 'a1234567-e89b-12d3-a456-426614174000', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('a8b8d82c-5f89-4d6e-89c9-e88e1b29bd6g', 'a2345678-e89b-12d3-a456-426614174001', CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('c6b6d82c-5f89-4d6e-89c9-e88e1b29bd6h', 'a3456789-e89b-12d3-a456-426614174002', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('e5b5d82c-5f89-4d6e-89c9-e88e1b29bd6i', 'a4567890-e89b-12d3-a456-426614174003', CURRENT_TIMESTAMP - INTERVAL '10 days');

-- Insert searches
INSERT INTO searches (id_usuario, tipo_busqueda, termino_busqueda, fecha_hora)
VALUES
  ('d7bed82c-5f89-4d6e-89c9-e88e1b29bd6e', 'juego', 'Magic', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('b9c9d82c-5f89-4d6e-89c9-e88e1b29bd6f', 'tienda', 'Card Masters', CURRENT_TIMESTAMP - INTERVAL '3 days'),
  ('a8b8d82c-5f89-4d6e-89c9-e88e1b29bd6g', 'actividad', 'torneo', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('c6b6d82c-5f89-4d6e-89c9-e88e1b29bd6h', 'juego', 'Pokémon', CURRENT_TIMESTAMP - INTERVAL '4 days'),
  ('e5b5d82c-5f89-4d6e-89c9-e88e1b29bd6i', 'tienda', 'Gamer''s Haven', CURRENT_TIMESTAMP - INTERVAL '5 days');