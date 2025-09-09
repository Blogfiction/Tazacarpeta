-- Eliminar la columna id_store de la tabla reports
-- ya que ahora usamos null para reportes generales

-- Primero eliminar las políticas que dependen de id_store
DROP POLICY IF EXISTS "View own reports" ON public.reports;
DROP POLICY IF EXISTS "Insert own reports" ON public.reports;

-- Luego eliminar la columna
ALTER TABLE public.reports 
DROP COLUMN IF EXISTS id_store;
