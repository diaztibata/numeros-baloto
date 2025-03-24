// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCBJReuUaI11pX7Rz9ssYNCGLJoojEg8E8",
    authDomain: "baloto-a6d7f.firebaseapp.com",
    projectId: "baloto-a6d7f",
    storageBucket: "baloto-a6d7f.firebasestorage.app",
    messagingSenderId: "1004239133954",
    appId: "1:1004239133954:web:ed2c5cbf4e0a1d18d5b61b"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables para almacenar el último número generado
let ultimoNumeroGenerado = null;

// Función para generar números aleatorios
function generarNumeros() {
    let numeros = [];
    while (numeros.length < 5) {
        let num = Math.floor(Math.random() * 43) + 1;
        if (!numeros.includes(num)) {
            numeros.push(num);
        }
    }
    let superBalota = Math.floor(Math.random() * 16) + 1;
    return { numeros, superBalota };
}

// Evento de generar números
document.getElementById("generar").addEventListener("click", () => {
    // Generar nuevos números y mostrarlos
    ultimoNumeroGenerado = generarNumeros();
    const texto = `Números: ${ultimoNumeroGenerado.numeros.join(" - ")} | SB: ${ultimoNumeroGenerado.superBalota}`;
    document.getElementById("numeros").textContent = texto;

    // Habilitar el botón de guardar
    document.getElementById("guardar").disabled = false;
});

// Evento para guardar números en Firestore
document.getElementById("guardar").addEventListener("click", () => {
    if (ultimoNumeroGenerado) {
        db.collection("baloto").add({
            numeros: ultimoNumeroGenerado.numeros,
            superBalota: ultimoNumeroGenerado.superBalota,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("Guardado en Firestore");
            cargarHistorial();
            
            // Deshabilitar el botón después de guardar
            document.getElementById("guardar").disabled = true;
        })
        .catch(error => console.error("Error al guardar:", error));
    }
});

// Cargar historial de Firestore
function cargarHistorial() {
    const historialLista = document.getElementById("historial");
    historialLista.innerHTML = "";

    db.collection("baloto").orderBy("timestamp", "desc").limit(10).get()
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const fecha = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : "Sin fecha";
            const item = document.createElement("li");
            item.textContent = `${fecha}: ${data.numeros.join(" - ")} | SB: ${data.superBalota}`;
            historialLista.appendChild(item);
        });
    })
    .catch(error => console.error("Error al cargar historial:", error));
}

// Cargar historial al abrir la app
cargarHistorial();
