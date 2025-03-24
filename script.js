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

// Variables
let ultimoNumeroGenerado = null;
let yaGuardado = false; // Variable para controlar si ya se guardó en este sorteo

// Función para verificar si estamos en el periodo de sorteo
function estaEnPeriodoDeSorteo() {
    const ahora = new Date();
    const dia = ahora.getUTCDay(); // 0 = Domingo, 6 = Sábado
    const hora = ahora.getUTCHours(); // Hora en UTC

    if (dia === 4 || dia === 5 || (dia === 6 && hora < 12)) {
        return "SORTEO1";
    }

    if (dia === 0 || dia === 1 || dia === 2 || (dia === 3 && hora < 12)) {
        return "SORTEO2";
    }

    return null; // Fuera de los rangos
}

// Verifica si el usuario ya guardó en este sorteo
function verificarGuardado() {
    const sorteoActual = estaEnPeriodoDeSorteo();
    if (!sorteoActual) {
        document.getElementById("guardar").disabled = true;
        return;
    }

    db.collection("baloto")
        .where("sorteo", "==", sorteoActual)
        .get()
        .then(snapshot => {
            yaGuardado = !snapshot.empty; // Si hay datos, ya guardó
            document.getElementById("guardar").disabled = yaGuardado;
        });
}

// Generar números (NO afecta el estado de "Guardar")
document.getElementById("generar").addEventListener("click", () => {
    ultimoNumeroGenerado = {
        numeros: Array.from({ length: 5 }, () => Math.floor(Math.random() * 43) + 1),
        superBalota: Math.floor(Math.random() * 16) + 1
    };
    document.getElementById("numeros").textContent = `Números: ${ultimoNumeroGenerado.numeros.join(" - ")} | SB: ${ultimoNumeroGenerado.superBalota}`;
});

// Guardar números (Solo si no se ha guardado antes)
document.getElementById("guardar").addEventListener("click", () => {
    if (yaGuardado) return alert("Ya guardaste tus números en este sorteo.");

    const sorteoActual = estaEnPeriodoDeSorteo();
    if (!sorteoActual) {
        alert("No es tiempo de guardar números.");
        return;
    }

    if (ultimoNumeroGenerado) {
        db.collection("baloto").add({
            ...ultimoNumeroGenerado,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            sorteo: sorteoActual
        })
        .then(() => {
            console.log("Guardado en Firestore");
            yaGuardado = true; // Bloqueamos el guardado
            document.getElementById("guardar").disabled = true; // Deshabilitamos el botón
            cargarHistorial();
        })
        .catch(error => console.error("Error al guardar:", error));
    }
});

// Cargar historial
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

// Ejecutar verificaciones al cargar la página
cargarHistorial();
verificarGuardado();
