const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Función que se conecta y devuelve la instancia de la base de datos
async function connectToDatabase() {
    try {
        await client.connect();
        // Cambia 'mi_base_de_datos' por el nombre de la DB que quieres usar
        const database = client.db('e_label_DB'); 
        console.log("Conexión establecida con éxito. 🔗");
        return database;
    } catch (err) {
        console.error("ERROR DE CONEXIÓN:", err);
        throw err;
    }
}

// Función para cerrar la conexión
async function closeConnection() {
    await client.close();
    console.log("Conexión cerrada. 👋");
}

// Exportamos las funciones para usarlas en otros archivos
module.exports = {
    connectToDatabase,
    closeConnection,
    client // Exportamos el cliente por si es necesario
}