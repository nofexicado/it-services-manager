-- ============================================================
-- RESET DE DATOS DE PRUEBA - IT Services Manager
--
-- Esto borra TODOS los tickets, subtareas, comentarios y
-- adjuntos de la base. Es irreversible.
--
-- NO toca:
--   - la tabla "tecnicos" (la nómina del equipo)
--   - la tabla "usuarios" (los logins y contraseñas ya creados:
--     jperez, pherrera, amartinez, dlopez, lromero, msosa
--     siguen funcionando exactamente igual después de correr esto)
--
-- RESTART IDENTITY además reinicia el contador de IDs, así que
-- el próximo ticket que crees vuelve a arrancar en TK-0001.
-- ============================================================

TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;
