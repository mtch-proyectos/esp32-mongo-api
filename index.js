const { MongoClient } = require('mongodb');

// TU URI DE CONEXIÓN COMPLETO (Copiar y Pegar aquí)
const uri = "mongodb+srv://mary1251:Caracas4711@cluster0.rmbngwa.mongodb.net/?appName=Cluster0";

// Crea una instancia del cliente de MongoDB
const client = new MongoClient(uri);

async function run() {
  try {
    // 1. Intenta conectarte al servidor de Atlas
    await client.connect();
    
    // 2. Accede a la base de datos de destino
    const database = client.db('mi_base_de_datos'); 
    
    // Opcional: accede a una colección para insertar un dato de prueba
    const collection = database.collection('documentos_prueba');

    // Inserta un documento para confirmar que tienes permisos de escritura
    const doc = { nombre: "Test", fecha: new Date() };
    await collection.insertOne(doc);

    console.log("¡Conexión y prueba de escritura exitosas! 🎉");
    console.log("Documento insertado en la colección 'documentos_prueba'.");
    
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