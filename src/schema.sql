CREATE TABLE IF NOT EXISTS tecnicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(100) DEFAULT 'Técnico',
    activo BOOLEAN DEFAULT TRUE
);

ALTER TABLE tecnicos ADD COLUMN IF NOT EXISTS rol VARCHAR(100) DEFAULT 'Técnico';

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    codigo_ticket VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    solicitante VARCHAR(150) DEFAULT 'Cliente Interno',
    descripcion_original TEXT,
    descripcion_gemini TEXT,
    prioridad VARCHAR(20) DEFAULT 'Media',
    estado VARCHAR(20) DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS solicitante VARCHAR(150) DEFAULT 'Cliente Interno';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'Pendiente';

CREATE TABLE IF NOT EXISTS ticket_tecnicos (
    ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
    tecnico_id INT REFERENCES tecnicos(id) ON DELETE CASCADE,
    PRIMARY KEY (ticket_id, tecnico_id)
);

CREATE TABLE IF NOT EXISTS subtareas (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tiempo_estimado_minutos INT DEFAULT 30,
    tiempo_real_minutos INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Pendiente'
);

CREATE TABLE IF NOT EXISTS subtarea_tecnicos (
    subtarea_id INT REFERENCES subtareas(id) ON DELETE CASCADE,
    tecnico_id INT REFERENCES tecnicos(id) ON DELETE CASCADE,
    PRIMARY KEY (subtarea_id, tecnico_id)
);

CREATE TABLE IF NOT EXISTS ticket_comentarios (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
    autor VARCHAR(100) DEFAULT 'Técnico',
    comentario TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_adjuntos (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    url_archivo TEXT NOT NULL,
    tipo VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserción/Actualización del personal técnico con sus roles de especialidad
INSERT INTO tecnicos (nombre, rol)
SELECT * FROM (VALUES
    ('Ana Martínez', 'Técnico de Comunicaciones'),
    ('Diego López', 'Técnico de Comunicaciones'),
    ('Lucas Romero', 'Ciberseguridad'),
    ('Martín Sosa', 'Jefe de Operaciones IT'),
    ('Pablo Herrera', 'Técnico Servidores y Sistemas'),
    ('Juan Pérez', 'Administrador de Redes y Sistemas')
) AS t(nombre, rol)
WHERE NOT EXISTS (SELECT 1 FROM tecnicos WHERE tecnicos.nombre = t.nombre);

-- =====================================================================
-- ACTUALIZACIÓN: comentarios y adjuntos ahora se asocian a una subtarea
-- puntual (ON DELETE CASCADE: nunca quedan huérfanos si se borra el ticket
-- o la subtarea). Es nullable para no romper filas históricas.
-- =====================================================================
ALTER TABLE ticket_comentarios ADD COLUMN IF NOT EXISTS subtarea_id INT REFERENCES subtareas(id) ON DELETE CASCADE;
ALTER TABLE ticket_adjuntos ADD COLUMN IF NOT EXISTS subtarea_id INT REFERENCES subtareas(id) ON DELETE CASCADE;

-- =====================================================================
-- LOGIN DE TÉCNICOS
-- El username se compara sin distinguir mayúsculas/minúsculas (LOWER()
-- en la consulta). La contraseña respeta mayúsculas/minúsculas y se
-- guarda hasheada (bcrypt) la primera vez que el técnico la escribe.
-- =====================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    tecnico_id INT REFERENCES tecnicos(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_activacion TIMESTAMP
);

INSERT INTO usuarios (tecnico_id, username)
SELECT t.id, v.username
FROM (VALUES
    ('Juan Pérez', 'jperez'),
    ('Pablo Herrera', 'pherrera'),
    ('Ana Martínez', 'amartinez'),
    ('Diego López', 'dlopez'),
    ('Lucas Romero', 'lromero'),
    ('Martín Sosa', 'msosa')
) AS v(nombre_tecnico, username)
JOIN tecnicos t ON t.nombre = v.nombre_tecnico
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.username = v.username);
