import { useRef, useEffect, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Search } from 'lucide-react';

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  defaultValue?: string;
  className?: string;
}

export default function PlacesAutocomplete({ 
  onPlaceSelect, 
  defaultValue = '', 
  className = '' 
}: PlacesAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    // Limpiar el autocomplete cuando el componente se desmonta
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    
    // Agregar listener para cerrar el menú cuando se hace click fuera
    document.addEventListener('click', handleClickOutside);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      // Cerrar el menú de autocompletado
      if (autocompleteRef.current) {
        google.maps.event.trigger(autocompleteRef.current, 'place_changed');
      }
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        setInputValue(place.formatted_address);
        onPlaceSelect(place);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        restrictions={{ country: "cl" }}
        options={{
          componentRestrictions: { country: "cl" },
          fields: ["address_components", "formatted_address", "geometry", "place_id"],
          strictBounds: false,
          types: ["address"]
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className={`retro-input pl-10 ${className}`}
          placeholder="Buscar ubicación..."
        />
      </Autocomplete>
    </div>
  );
}