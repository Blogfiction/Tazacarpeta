/*
  # Add geolocation columns to activities table

  1. Changes
    - Add lat column (latitude) as DOUBLE PRECISION
    - Add lng column (longitude) as DOUBLE PRECISION
    - Add place_id column as TEXT

  2. Purpose
    - Enable storing location data for activities
    - Support Google Maps integration
    - Allow geocoding and reverse geocoding
*/

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS place_id TEXT;

-- Create index for place_id to improve lookup performance
CREATE INDEX IF NOT EXISTS idx_activities_place_id ON activities(place_id);

-- Create index for coordinates to improve geospatial queries
CREATE INDEX IF NOT EXISTS idx_activities_coordinates ON activities(lat, lng);