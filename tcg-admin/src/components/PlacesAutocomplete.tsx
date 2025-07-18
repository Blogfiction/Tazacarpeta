import { useRef, useEffect, useState, useCallback } from 'react';
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
  
  // Memoizar el handler del click outside para poder limpiarlo correctamente
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      // Solo cerramos el menú, no disparamos 'place_changed' que puede causar problemas
      // con el estado del formulario
      if (autocompleteRef.current) {
        // No hacemos nada aquí, solo cerramos el menú
      }
    }
  }, []);

  // Manejar la actualización del defaultValue cuando cambia
  useEffect(() => {
    if (defaultValue !== inputValue) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  // Configurar y limpiar listeners
  useEffect(() => {
    // Registrar el listener para clicks fuera
    document.addEventListener('click', handleClickOutside);
    
    // Limpiar al desmontar
    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [handleClickOutside]);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      try {
        const place = autocompleteRef.current.getPlace();
        // Verificar que tenemos un lugar válido con toda la información necesaria
        if (place && place.formatted_address && place.place_id) {
          setInputValue(place.formatted_address);
          // Solo notificamos al componente padre si el lugar es válido
          onPlaceSelect(place);
        } else if (!place || !place.formatted_address) {
          // Si el usuario presiona Enter sin seleccionar una dirección del dropdown,
          // no hacemos nada para evitar perder el estado del formulario
          console.log('Ubicación incompleta o inválida');
        }
      } catch (error) {
        console.error('Error al obtener el lugar:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div 
      className="relative"
      // Evitar que clics dentro del componente se propaguen al modal
      onClick={(e) => e.stopPropagation()}
    >
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
          autoComplete="off" // Prevenir que el navegador muestre su propio autocompletado
          // Asegurarse de que el clic en el input no cierre nada
          onClick={(e) => e.stopPropagation()}
        />
      </Autocomplete>
    </div>
  );
}