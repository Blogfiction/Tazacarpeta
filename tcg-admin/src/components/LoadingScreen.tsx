import { Loader } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-gray-800 mx-auto mb-4" />
        <p className="font-press-start text-sm text-gray-800">Cargando...</p>
      </div>
    </div>
  );
}