// server.js
// Importamos las funciones desde nuestro archivo de conexión

const requireApiKey = require('./middleware/authMiddleware'); // Importa la función de middleware
const express = require('express');
const app = express();
const port = 3000; // Puerto donde escuchará el servidor

// 💡 IMPORTANTE: Asegúrate de que esta línea esté al inicio
// para que Express pueda leer el JSON enviado en el cuerpo de la petición.
app.use(express.json()); 

const { connectToDatabase, closeConnection } = require('./db_connect'); // Importa tus funciones de conexión

// --- RUTA API PARA ADMIN: INGRESAR PRODUCTO ---
// Añadir nuevo producto (CREATE)
app.post('/admin/productos', requireApiKey, async (req, res) => {
    let db;
    try {
        db = await connectToDatabase();
        const productosCollection = db.collection('productos');
        
        // req.body ahora contiene el objeto JSON enviado por la aplicación web.
        const nuevoProducto = req.body;

        // **VALIDACIÓN DE DATOS**:
        if (!nuevoProducto.codigoProducto || !nuevoProducto.descripcion || typeof nuevoProducto.precioBase !== 'number') {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos o el precioBase no es un número.' 
            });
        }

        const resultado = await productosCollection.insertOne(nuevoProducto);
        
        res.status(201).json({ 
            message: 'Producto creado exitosamente.', 
            productoId: resultado.insertedId 
        });

    } catch (err) {
        // Manejo de error de duplicidad (código 11000)
        if (err.code === 11000) {
            console.error(`Error de duplicidad al crear producto: ${nuevoProducto.codigoProducto}`);
            return res.status(409).json({ error: 'El código de producto ya existe.' });
        }
        
        console.error("Error al crear producto:", err);
        res.status(500).json({ error: 'Error interno al insertar el producto.' });
    }
});
// --- RUTA API PARA ADMIN: CONSULTAR PRODUCTOS ---
// Obtener todos los productos (READ - ALL)
app.get('/admin/productos', requireApiKey, async (req, res) => {
    let db;
    try {
        db = await connectToDatabase();
        const productosCollection = db.collection('productos');
        
        console.log("Consulta: Obteniendo catálogo completo.");
        
        // Busca todos los documentos en la colección y los convierte a un array.
        // Opcional: Puedes añadir .sort({ codigoProducto: 1 }) para ordenarlos.
        const productos = await productosCollection.find({}).toArray();

        // Respuesta exitosa: código 200 (OK) por defecto
        res.json(productos); 

    } catch (err) {
        console.error("Error al leer productos:", err);
        res.status(500).json({ error: 'Error interno del servidor al consultar el catálogo.' });
    }
});
// --- RUTA API PARA ADMIN: ACTUALIZAR PRODUCTO ---
// Modificar un producto existente (UPDATE)
app.put('/admin/productos/:codigo',requireApiKey, async (req, res) => {
    let db;
    try {
        db = await connectToDatabase();
        const productosCollection = db.collection('productos');
        
        const codigoBuscado = req.params.codigo; // Obtiene el código de la URL
        const datosAActualizar = req.body;       // Obtiene los datos a cambiar del cuerpo JSON
        
        // ❌ ¡Exclusión de _id y código! No permitimos que se actualicen la clave principal.
        delete datosAActualizar._id;
        delete datosAActualizar.codigoProducto; 

        // 1. Ejecutar la actualización en MongoDB
        const resultado = await productosCollection.updateOne(
            { codigoProducto: codigoBuscado }, // FILTRO: ¿Qué documento actualizar?
            { $set: datosAActualizar }        // OPERACIÓN: Establecer los nuevos valores
        );

        if (resultado.matchedCount === 0) {
            // No se encontró ningún producto con ese código
            return res.status(404).json({ error: `Producto con código ${codigoBuscado} no encontrado.` });
        }
        
        // 2. Notificación al usuario
        res.json({ 
            message: 'Producto actualizado correctamente.', 
            modifiedCount: resultado.modifiedCount 
        });

    } catch (err) {
        console.error("Error al actualizar producto:", err);
        res.status(500).json({ error: 'Error interno del servidor al actualizar.' });
    }
});
//
// --- RUTA API PARA CLIENTES (ESP32): OBTENER PRODUCTOS CON ETIQUETA ---
// Obtener solo productos que tienen el campo 'idEtiqueta'
app.get('/api/etiquetas', async (req, res) => {
    let db;
    try {
        db = await connectToDatabase();
        const productosCollection = db.collection('productos');
        
        // ... (Tu consulta de find y proyección, usando Solución 1 o 2)

        const productosFiltrados = await productosCollection.find(
            //{ idEtiqueta: { $exists: true } },
            { idEtiqueta: { $ne: null } },
            { projection: {
                codigoProducto: 1,
                descripcion: 1,
                idEtiqueta: 1,
                precioBase: 1, 
                _id: 0 
            }}
        ).toArray();

        res.json(productosFiltrados); 

    } catch (err) {
        console.error("Error al consultar etiquetas para ESP32:", err);
        res.status(500).json({ error: 'Error interno del servidor al consultar etiquetas.' });
    }
});
// server.js (Añade esta ruta después de la ruta PUT)

// --- RUTA API PARA ADMIN: ELIMINAR PRODUCTO ---
// Eliminar producto por código (DELETE)
app.delete('/admin/productos/:codigo', requireApiKey,async (req, res) => {
    let db;
    try {
        db = await connectToDatabase();
        const productosCollection = db.collection('productos');
        
        const codigoBuscado = req.params.codigo; // Obtiene el código de la URL

        // 1. Ejecutar la operación de eliminación
        const resultado = await productosCollection.deleteOne({ codigoProducto: codigoBuscado });

        if (resultado.deletedCount === 0) {
            // No se encontró ningún producto con ese código para eliminar
            return res.status(404).json({ error: `Producto con código ${codigoBuscado} no encontrado.` });
        }
        
        // 2. Notificación al usuario
        res.json({ 
            message: `Producto ${codigoBuscado} eliminado correctamente.`,
            deletedCount: resultado.deletedCount
        });

    } catch (err) {
        console.error("Error al eliminar producto:", err);
        res.status(500).json({ error: 'Error interno del servidor al eliminar.' });
    }
});
// Nota: Asegúrate de que el middleware app.use(express.json()); esté antes de todas las rutas.
// Iniciar el servidor
app.listen(port, () => {
    console.log(`✅ Servidor API corriendo en http://localhost:${port}`);
    // Asegúrate de usar la ruta correcta para la administración en los logs
    console.log(`Punto de ingreso de producto: http://localhost:${port}/admin/productos [POST]`); 
});