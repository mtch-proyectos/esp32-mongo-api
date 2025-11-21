const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

// Crea una instancia del cliente de MongoDB
const client = new MongoClient(uri);

async function run() {
  try {
    // 1. Intenta conectarte al servidor de Atlas
    await client.connect();
    
    // 2. Accede a la base de datos de destino
    const database = client.db('e_label_DB'); 
    
    // Opcional: accede a una colección para insertar un dato de prueba
    const collection = database.collection('productos');

    // Inserta un documento para confirmar que tienes permisos de escritura
    const doc = {  codProducto: "Test", fecha: new Date() };
    await collection.insertOne(doc);

    console.log("¡Conexión y prueba de escritura exitosas! 🎉");
    console.log("Documento insertado en la colección 'productos'.");
    
  } catch (err) {
    // Muestra el error si falla la conexión
    console.error("Fallo la conexión o la operación:", err);
  } finally {
    // 3. Cierra la conexión al finalizar
    await client.close();
    console.log("Conexión cerrada.");
  }
}

run();