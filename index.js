// server/index.js (CÓDIGO COMPLETO PARA GITHUB)

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Permitir peticiones desde cualquier origen (Tu extensión)
app.use(cors());

// ==========================================
// 🔒 CANDADO DE SEGURIDAD (ANTI-ROBO)
// ==========================================
app.use((req, res, next) => {
    // 1. LA CONTRASEÑA REAL (La extensión ya la decodificó antes de enviarla)
    const CLAVE_MAESTRA = 'CRM_PROTEGIDO_2025';

    // 2. Si es la página de inicio '/', dejamos pasar (Para UptimeRobot)
    if (req.path === '/') return next();

    // 3. Revisamos si la petición trae la llave en los encabezados
    const tokenRecibido = req.headers['x-auth-token'];

    // 4. Si la llave no coincide, bloqueamos el acceso
    if (tokenRecibido !== CLAVE_MAESTRA) {
        // Imprimimos en consola el intento fallido (visible en los logs de Render)
        console.log(`⛔ Intento de acceso denegado desde IP: ${req.ip}`);
        
        // Respondemos con error 403 (Prohibido)
        return res.status(403).send('⛔ ACCESO DENEGADO: Servidor Privado.');
    }

    // 5. Si la llave es correcta, dejamos pasar a los archivos
    next();
});
// ==========================================

// Servir tus scripts (content_auth.js, etc.) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz para UptimeRobot (Mantiene el servidor despierto)
app.get('/', (req, res) => {
    res.send('✅ Servidor CRM Activo y Seguro (24/7)');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
