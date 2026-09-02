-- Agregar columna id_departamento a la tabla planta
-- Ejecutar este script para asociar plantas con departamentos

ALTER TABLE planta
ADD COLUMN IF NOT EXISTS id_departamento INTEGER;

-- Crear constraint de foreign key si no existe
ALTER TABLE planta
ADD CONSTRAINT IF NOT EXISTS fk_planta_departamento 
FOREIGN KEY (id_departamento) REFERENCES departamento(id_departamento) ON DELETE SET NULL;

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_planta_departamento ON planta(id_departamento);
CREATE INDEX IF NOT EXISTS idx_planta_provincia_departamento ON planta(id_provincia, id_departamento);
