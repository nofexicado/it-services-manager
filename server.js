require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const Groq = require('groq-sdk');
const { pool } = require('./src/db');

const app = express();

// Middlewares para lectura de datos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------
// FRONTEND (SPA React + Vite) Y ESTÁTICOS
// El frontend vive en frontend/dist (build de Vite con base /itsm/).
// El server NO buildea: se copia dist/ ya compilado (deploy Modelo A).
// -------------------------------------------------------------
const frontendDist = path.join(__dirname, 'frontend', 'dist');

// Evidencias subidas por los técnicos (multer escribe en public/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/itsm/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Assets del build (JS/CSS/imgs con hash) servidos bajo /itsm
app.use('/itsm', express.static(frontendDist));

// La raíz redirige al panel
app.get('/', (req, res) => res.redirect('/itsm'));

// Configuración de Multer para Subida de Archivos
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Inicializar cliente Groq AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// -------------------------------------------------------------
// LOGIN DE TÉCNICOS
// -------------------------------------------------------------

// POST: Login (usuario insensible a mayúsculas, contraseña sensible)
// Si el usuario todavía no tiene contraseña guardada, la primera que
// escribe queda establecida como su contraseña definitiva.
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }
    try {
        const userRes = await pool.query(
            `SELECT u.id, u.username, u.password_hash, u.tecnico_id, t.nombre AS tecnico_nombre, t.rol AS tecnico_rol
             FROM usuarios u
             JOIN tecnicos t ON t.id = u.tecnico_id
             WHERE LOWER(u.username) = LOWER($1)`,
            [username]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no reconocido.' });
        }

        const user = userRes.rows[0];

        // Primer inicio de sesión: se establece la contraseña definitiva
        if (!user.password_hash) {
            const hash = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE usuarios SET password_hash = $1, fecha_activacion = CURRENT_TIMESTAMP WHERE id = $2',
                [hash, user.id]
            );
            return res.json({
                success: true,
                primera_vez: true,
                usuario: {
                    id: user.id,
                    username: user.username,
                    nombre: user.tecnico_nombre,
                    rol: user.tecnico_rol,
                    tecnico_id: user.tecnico_id
                }
            });
        }

        // Inicios de sesión posteriores: se valida contra el hash guardado
        const coincide = await bcrypt.compare(password, user.password_hash);
        if (!coincide) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        res.json({
            success: true,
            primera_vez: false,
            usuario: {
                id: user.id,
                username: user.username,
                nombre: user.tecnico_nombre,
                rol: user.tecnico_rol,
                tecnico_id: user.tecnico_id
            }
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// GET: KPIs del Dashboard
app.get('/api/kpis', async (req, res) => {
    try {
        const totalTickets = await pool.query('SELECT COUNT(*) FROM tickets');
        const ticketsPendientes = await pool.query("SELECT COUNT(*) FROM tickets WHERE estado = 'Pendiente'");
        const ticketsProgreso = await pool.query("SELECT COUNT(*) FROM tickets WHERE estado = 'En Progreso'");
        const ticketsResueltos = await pool.query("SELECT COUNT(*) FROM tickets WHERE estado = 'Resuelto'");
        const totalTecnicos = await pool.query('SELECT COUNT(*) FROM tecnicos WHERE activo = TRUE');

        res.json({
            total_tickets: parseInt(totalTickets.rows[0].count),
            pendientes: parseInt(ticketsPendientes.rows[0].count),
            en_progreso: parseInt(ticketsProgreso.rows[0].count),
            resueltos: parseInt(ticketsResueltos.rows[0].count),
            tecnicos_activos: parseInt(totalTecnicos.rows[0].count)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Obtener todos los tickets
app.get('/api/tickets', async (req, res) => {
    try {
        const query = `
            SELECT 
                t.*,
                COUNT(s.id) as total_subtareas,
                SUM(CASE WHEN s.estado = 'Completada' THEN 1 ELSE 0 END) as subtareas_completadas,
                COALESCE(
                    json_agg(DISTINCT jsonb_build_object('id', tec.id, 'nombre', tec.nombre, 'rol', tec.rol)) 
                    FILTER (WHERE tec.id IS NOT NULL), '[]'
                ) as tecnicos_asignados
            FROM tickets t
            LEFT JOIN subtareas s ON t.id = s.ticket_id
            LEFT JOIN ticket_tecnicos tt ON t.id = tt.ticket_id
            LEFT JOIN tecnicos tec ON tt.tecnico_id = tec.id
            GROUP BY t.id
            ORDER BY t.fecha_creacion DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Obtener detalle completo de un ticket
app.get('/api/tickets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const ticketRes = await pool.query(`
            SELECT t.*,
                COALESCE(
                    (SELECT json_agg(jsonb_build_object('id', tec.id, 'nombre', tec.nombre, 'rol', tec.rol))
                     FROM ticket_tecnicos tt
                     JOIN tecnicos tec ON tec.id = tt.tecnico_id
                     WHERE tt.ticket_id = t.id), '[]'
                ) as tecnicos_asignados
            FROM tickets t
            WHERE t.id = $1
        `, [id]);

        if (ticketRes.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }
        const ticket = ticketRes.rows[0];

        // Subtareas con sus técnicos, comentarios y adjuntos propios
        // (subconsultas correlacionadas para evitar el "fan-out" de filas
        // que se produce si se hacen varios LEFT JOIN 1-a-muchos a la vez)
        const subtareasRes = await pool.query(`
            SELECT s.*,
                COALESCE(
                    (SELECT json_agg(jsonb_build_object('id', tec.id, 'nombre', tec.nombre, 'rol', tec.rol))
                     FROM subtarea_tecnicos st
                     JOIN tecnicos tec ON tec.id = st.tecnico_id
                     WHERE st.subtarea_id = s.id), '[]'
                ) as tecnicos,
                COALESCE(
                    (SELECT json_agg(jsonb_build_object('id', c.id, 'autor', c.autor, 'comentario', c.comentario, 'fecha', c.fecha) ORDER BY c.fecha ASC)
                     FROM ticket_comentarios c
                     WHERE c.subtarea_id = s.id), '[]'
                ) as comentarios,
                COALESCE(
                    (SELECT json_agg(jsonb_build_object('id', a.id, 'nombre_archivo', a.nombre_archivo, 'url_archivo', a.url_archivo, 'tipo', a.tipo, 'fecha', a.fecha) ORDER BY a.fecha ASC)
                     FROM ticket_adjuntos a
                     WHERE a.subtarea_id = s.id), '[]'
                ) as adjuntos
            FROM subtareas s
            WHERE s.ticket_id = $1
            ORDER BY s.id ASC;
        `, [id]);

        ticket.subtareas = subtareasRes.rows;

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Obtener técnicos activos
app.get('/api/tecnicos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tecnicos WHERE activo = TRUE ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Crear nuevo ticket con Asistencia IA Groq
app.post('/api/tickets/ia-sugerencia', async (req, res) => {
    const { titulo, descripcion, solicitante, prioridad, tecnicos_ids } = req.body;
    try {
        const prompt = `
Eres un Ingeniero Principal de IT y Mesa de Ayuda. Analiza el siguiente requerimiento o fallo técnico y genera un desglose en formato JSON estricto.

Requerimiento:
Título: ${titulo}
Descripción: ${descripcion}

Devuelve UNICAMENTE un objeto JSON con la siguiente estructura:
{
  "descripcion_gemini": "Análisis técnico resumido del problema y su enfoque táctico.",
  "subtareas": [
    {
      "titulo": "Título de la subtarea",
      "descripcion": "Instrucciones detalladas de ejecución",
      "tiempo_estimado_minutos": 30
    }
  ]
}
`;
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-20b',
            temperature: 0.2,
            response_format: { type: 'json_object' }
        });

        const iaResponse = JSON.parse(completion.choices[0].message.content);

        // Generar Código de Ticket Único
        const countRes = await pool.query('SELECT COUNT(*) FROM tickets');
        const nextId = parseInt(countRes.rows[0].count) + 1;
        const codigoTicket = `TK-${String(nextId).padStart(4, '0')}`;

        // Insertar Ticket en DB
        const ticketQuery = `
            INSERT INTO tickets (codigo_ticket, titulo, solicitante, descripcion_original, descripcion_gemini, prioridad, estado)
            VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente')
            RETURNING *;
        `;
        const newTicket = await pool.query(ticketQuery, [
            codigoTicket,
            titulo,
            solicitante || 'Cliente Interno',
            descripcion,
            iaResponse.descripcion_gemini,
            prioridad || 'Media'
        ]);

        const ticketId = newTicket.rows[0].id;

        // Insertar Subtareas
        if (iaResponse.subtareas && iaResponse.subtareas.length > 0) {
            for (const sub of iaResponse.subtareas) {
                await pool.query(
                    `INSERT INTO subtareas (ticket_id, titulo, descripcion, tiempo_estimado_minutos, estado)
                     VALUES ($1, $2, $3, $4, 'Pendiente')`,
                    [ticketId, sub.titulo, sub.descripcion, sub.tiempo_estimado_minutos || 30]
                );
            }
        }

        // Asignar técnicos seleccionados en el modal de creación al ticket
        // (esto es lo que faltaba: el formulario ya mandaba tecnicos_ids
        // pero nunca se guardaba en ticket_tecnicos)
        if (Array.isArray(tecnicos_ids) && tecnicos_ids.length > 0) {
            for (const tecnicoId of tecnicos_ids) {
                const idNum = parseInt(tecnicoId);
                if (!isNaN(idNum)) {
                    await pool.query(
                        `INSERT INTO ticket_tecnicos (ticket_id, tecnico_id) VALUES ($1, $2)
                         ON CONFLICT (ticket_id, tecnico_id) DO NOTHING`,
                        [ticketId, idNum]
                    );
                }
            }
        }

        res.json({ success: true, ticket_id: ticketId });
    } catch (err) {
        console.error("Error al crear ticket con IA:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST: Cambiar Estado General del Ticket
app.post('/api/tickets/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await pool.query('UPDATE tickets SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ success: true, estado });
    } catch (err) {
        console.error("Error al actualizar estado general:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST: Reasignar técnicos del ticket (chips del header en ticket.html)
app.post('/api/tickets/:id/tecnicos', async (req, res) => {
    const { id } = req.params;
    const { tecnicos_ids } = req.body;
    try {
        await pool.query('DELETE FROM ticket_tecnicos WHERE ticket_id = $1', [id]);
        if (Array.isArray(tecnicos_ids)) {
            for (const tecnicoId of tecnicos_ids) {
                const idNum = parseInt(tecnicoId);
                if (!isNaN(idNum)) {
                    await pool.query(
                        `INSERT INTO ticket_tecnicos (ticket_id, tecnico_id) VALUES ($1, $2)
                         ON CONFLICT (ticket_id, tecnico_id) DO NOTHING`,
                        [id, idNum]
                    );
                }
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Error al reasignar técnicos:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST: Editar título/descripción de una subtarea (las subtareas que
// genera la IA quedan editables por cualquier técnico)
app.post('/api/subtareas/:id/editar', async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, tiempo_estimado_minutos } = req.body;
    try {
        await pool.query(
            `UPDATE subtareas
             SET titulo = COALESCE($1, titulo),
                 descripcion = COALESCE($2, descripcion),
                 tiempo_estimado_minutos = COALESCE($3, tiempo_estimado_minutos)
             WHERE id = $4`,
            [titulo, descripcion, tiempo_estimado_minutos ? parseInt(tiempo_estimado_minutos) : null, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error al editar subtarea:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST: Actualizar Subtarea y Asignarle Técnico
app.post('/api/subtareas/actualizar', async (req, res) => {
    const { subtarea_id, estado, minutos, tecnico_id } = req.body;
    try {
        if (estado) {
            await pool.query(
                'UPDATE subtareas SET estado = $1, tiempo_real_minutos = tiempo_real_minutos + $2 WHERE id = $3',
                [estado, minutos || 0, subtarea_id]
            );
        }

        if (tecnico_id) {
            await pool.query('DELETE FROM subtarea_tecnicos WHERE subtarea_id = $1', [subtarea_id]);
            await pool.query('INSERT INTO subtarea_tecnicos (subtarea_id, tecnico_id) VALUES ($1, $2)', [subtarea_id, tecnico_id]);
        }

        // Auto-sincronizar estado general del ticket según avance de subtareas
        const subRes = await pool.query('SELECT ticket_id FROM subtareas WHERE id = $1', [subtarea_id]);
        if (subRes.rows.length > 0) {
            const ticketId = subRes.rows[0].ticket_id;
            const statusCheck = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'Completada' THEN 1 ELSE 0 END) as completadas,
                    SUM(CASE WHEN estado = 'En Progreso' THEN 1 ELSE 0 END) as en_progreso
                FROM subtareas WHERE ticket_id = $1
            `, [ticketId]);

            const { total, completadas, en_progreso } = statusCheck.rows[0];
            let nuevoEstadoGeneral = 'Pendiente';

            if (parseInt(completadas) === parseInt(total) && parseInt(total) > 0) {
                nuevoEstadoGeneral = 'Resuelto';
            } else if (parseInt(completadas) > 0 || parseInt(en_progreso) > 0) {
                nuevoEstadoGeneral = 'En Progreso';
            }

            await pool.query('UPDATE tickets SET estado = $1 WHERE id = $2', [nuevoEstadoGeneral, ticketId]);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Error en actualizar subtarea:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST: Agregar Comentario con Evidencia/Adjunto a una Subtarea puntual
// El middleware de Multer va envuelto para que un error de subida (multer
// arroja ANTES de llegar al handler, y por defecto ese error se escapa del
// try/catch de abajo) también quede logueado y responda JSON en vez de
// romper silenciosamente.
app.post('/api/tickets/:id/comentarios', (req, res, next) => {
    upload.single('archivo')(req, res, (err) => {
        if (err) {
            console.error("❌ Error de Multer al subir el archivo:", err.message);
            return res.status(400).json({ error: `Error al subir el archivo: ${err.message}` });
        }
        next();
    });
}, async (req, res) => {
    const { id } = req.params;
    const { autor, comentario, subtarea_id } = req.body;
    const subtareaIdVal = subtarea_id ? parseInt(subtarea_id) : null;

    // Diagnóstico: esto se ve en la consola donde corre "npm start"
    console.log('--- Nuevo comentario/evidencia ---');
    console.log('ticket_id:', id, '| subtarea_id:', subtareaIdVal, '| autor:', autor);
    console.log('archivo recibido por multer:', req.file ? req.file.originalname : '(ningún archivo llegó al servidor)');

    try {
        let url_archivo = null;
        let nombre_archivo = null;

        if (req.file) {
            url_archivo = `/uploads/${req.file.filename}`;
            nombre_archivo = req.file.originalname;

            await pool.query(
                'INSERT INTO ticket_adjuntos (ticket_id, subtarea_id, nombre_archivo, url_archivo, tipo) VALUES ($1, $2, $3, $4, $5)',
                [id, subtareaIdVal, nombre_archivo, url_archivo, req.file.mimetype.startsWith('image/') ? 'Imagen' : 'Documento']
            );
            console.log('✅ Adjunto guardado en DB y en public/uploads:', req.file.filename);
        }

        const result = await pool.query(
            'INSERT INTO ticket_comentarios (ticket_id, subtarea_id, autor, comentario) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, subtareaIdVal, autor || 'Técnico', comentario]
        );

        res.json({ success: true, comentario: result.rows[0], url_archivo });
    } catch (err) {
        console.error("Error al agregar comentario:", err);
        res.status(500).json({ error: err.message });
    }
});

// SPA fallback: cualquier ruta /itsm/* que no sea un archivo real del build
// (deep links de React Router: /itsm/ticket/123, etc.) devuelve el index.
app.get('/itsm*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

// Inicialización del Servidor en Red Local
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🚀 SERVIDOR ITSM IA ACTIVO EN http://${HOST}:${PORT}`);
    console.log(`====================================================`);
});
