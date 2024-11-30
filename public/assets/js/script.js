const ESP32_URL = "http://192.168.100.47"; // Cambia esto por la IP de tu ESP32

// Función para manejar el encendido y apagado de focos
function handleSwitch(event) {
    console.log(event);
    const focoId = event.target.closest('button').getAttribute("attr-focoId");
    const action = event.target.id.toLowerCase(); // "encender" o "apagar"
    
    console.log(focoId, action);
    fetch(`${ESP32_URL}/${action}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `foco=${focoId}`,
    })
        .then((response) => {
            if (!response.ok) {
                console.error(`Error al intentar ${action} el foco ${focoId}: ${response.statusText}`);
            }
        })
        .catch((error) => {
            console.error(`Error al enviar la solicitud para el foco ${focoId}:`, error);
        });
}

// Función para manejar el cambio de luminosidad
function handleLuminosity(event) {
    const focoId = event.target.getAttribute("attr-focoId");
    const luminosity = event.target.value;

    fetch(`${ESP32_URL}/brillo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `foco=${focoId}&valor=${luminosity}`,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.statusText}`);
            }
            return response.text();
        })
        .then((data) => {
            console.log("Respuesta del servidor:", data);
        })
        .catch((error) => {
            console.error(`Error al enviar la solicitud de luminosidad para el foco ${focoId}:`, error);
        });
}

// Función para obtener y sincronizar el estado de los focos
function syncState() {
    fetch(`${ESP32_URL}/estado`, {
        method: "GET",
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`Error al obtener el estado: ${response.statusText}`);
        }
        return response.json();
    }).then((data) => {
        // Actualizar sliders y estado de los botones según el estado de los focos
        Object.keys(data).forEach((focoKey, index) => {
            const luminosity = data[focoKey];
            const id=focoKey;
            
            // Actualizar el control de rango
            const slider = document.querySelector(`#luminosidad[attr-focoId="${id}"]`);
            
            if (slider) {
                slider.value = luminosity;
            }

            // Actualizar estado de los botones de encendido/apagado (opcional)
            const switchA = document.querySelector(`.switch-icon[attr-focoId="${id}"]`);
            if (switchA) {
                if (luminosity > 0) {
                    switchA.classList.add("active");
                } else {
                    switchA.classList.remove("active");
                }
            }
        });
    })
        .catch((error) => {
            console.error("Error al sincronizar el estado de los focos:", error);
        });
}

// Asignar eventos a los spans dentro de los botones
document.querySelectorAll("button.switch-icon span").forEach((span) => {
    span.addEventListener("click", handleSwitch);
});

// Asignar eventos a los controles de luminosidad
document.querySelectorAll("input[type='range']").forEach((slider) => {
    slider.addEventListener("input", handleLuminosity);
});

// Inicializar estado al cargar la página
syncState();

// Sincronizar el estado cada 10 segundos
setInterval(syncState, 2000);
