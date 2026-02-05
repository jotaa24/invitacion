/**
 * ============================================
 * INVITACIÓN DIGITAL - XV AÑOS
 * JavaScript Vanilla
 * ============================================
 */

// ============================================
// CONFIGURACIÓN EDITABLE
// ============================================

/**
 * Fecha y hora del evento
 * Formato: "YYYY-MM-DDTHH:MM:SS"
 * Ejemplo: "2026-10-15T21:00:00" = 15 de Octubre 2026 a las 21:00 hs
 */
const EVENT_DATE = new Date("2026-10-15T21:00:00");

/**
 * Textos del contador
 * Podés personalizar los mensajes aquí
 */
const COUNTDOWN_TEXTS = {
    label: "Faltan",
    expired: "¡El gran día ha llegado! 🎉",
    days: "Días",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos"
};

// ============================================
// CONTADOR REGRESIVO
// ============================================

/**
 * Calcula la diferencia de tiempo entre ahora y la fecha del evento
 * @returns {Object} Objeto con días, horas, minutos y segundos restantes
 */
function getTimeRemaining() {
    const now = new Date().getTime();
    const eventTime = EVENT_DATE.getTime();
    const distance = eventTime - now;

    // Si el evento ya pasó, devolver ceros
    if (distance < 0) {
        return {
            expired: true,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    // Calcular tiempo restante
    return {
        expired: false,
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
}

/**
 * Formatea un número con ceros a la izquierda
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado con dos dígitos
 */
function padNumber(num) {
    return String(num).padStart(2, "0");
}

/**
 * Actualiza el DOM con los valores del contador
 */
function updateCountdownDisplay() {
    const time = getTimeRemaining();
    
    // Obtener elementos del DOM
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    const messageEl = document.getElementById("countdown-message");
    const displayEl = document.getElementById("countdown-display");

    // Verificar que los elementos existen
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        console.error("Error: No se encontraron los elementos del contador");
        return;
    }

    // Si el evento ya pasó
    if (time.expired) {
        if (displayEl) {
            displayEl.style.display = "none";
        }
        if (messageEl) {
            messageEl.textContent = COUNTDOWN_TEXTS.expired;
            messageEl.style.display = "block";
        }
        return;
    }

    // Actualizar valores
    daysEl.textContent = padNumber(time.days);
    hoursEl.textContent = padNumber(time.hours);
    minutesEl.textContent = padNumber(time.minutes);
    secondsEl.textContent = padNumber(time.seconds);
}

/**
 * Inicializa el contador y configura el intervalo
 */
function initCountdown() {
    // Actualizar inmediatamente
    updateCountdownDisplay();

    // Actualizar cada segundo
    setInterval(updateCountdownDisplay, 1000);

    console.log("✓ Contador regresivo inicializado");
    console.log("📅 Fecha del evento:", EVENT_DATE.toLocaleString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }));
}

// ============================================
// FUNCIONALIDAD: COPIAR AL PORTAPAPELES
// ============================================

/**
 * Copia texto al portapapeles y muestra feedback visual
 * @param {string} text - Texto a copiar
 * @param {HTMLElement} button - Botón que disparó la acción
 */
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Feedback visual
        button.classList.add("copied");
        
        // Cambiar ícono temporalmente
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;

        // Restaurar después de 2 segundos
        setTimeout(() => {
            button.classList.remove("copied");
            button.innerHTML = originalHTML;
        }, 2000);

        console.log("✓ Texto copiado:", text);
    } catch (err) {
        console.error("Error al copiar:", err);
        
        // Fallback para navegadores antiguos
        fallbackCopyToClipboard(text);
    }
}

/**
 * Método alternativo para copiar (navegadores antiguos)
 * @param {string} text - Texto a copiar
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand("copy");
        console.log("✓ Texto copiado (fallback):", text);
    } catch (err) {
        console.error("Error en fallback:", err);
    }

    document.body.removeChild(textArea);
}

/**
 * Inicializa los botones de copiar
 */
function initCopyButtons() {
    const copyButtons = document.querySelectorAll(".copy-btn");

    copyButtons.forEach(button => {
        button.addEventListener("click", function() {
            const textToCopy = this.getAttribute("data-copy");
            if (textToCopy) {
                copyToClipboard(textToCopy, this);
            }
        });
    });

    if (copyButtons.length > 0) {
        console.log("✓ Botones de copiar inicializados:", copyButtons.length);
    }
}

// ============================================
// FORMULARIO RSVP - WHATSAPP
// ============================================

/**
 * Número de WhatsApp de destino (sin +)
 * Editar este valor para cambiar el destinatario
 */
const WHATSAPP_NUMBER = "5491123141321";

/**
 * Genera el mensaje de WhatsApp con formato premium
 * @param {Object} data - Datos del formulario
 * @returns {string} Mensaje formateado
 */
function generateWhatsAppMessage(data) {
    const { nombre, apellido, asistencia, alimentacion, cancion, mensajeExtra } = data;
    
    // Estado de asistencia formateado
    const asistenciaTexto = asistencia === "Confirmo" ? "Confirmada" : "No podrá asistir";
    
    // Construir mensaje elegante y sobrio
    let mensaje = `*Confirmación de asistencia*\n\n`;
    
    // Campos obligatorios
    mensaje += `*Nombre:*\n${nombre} ${apellido}\n\n`;
    mensaje += `*Asistencia:*\n${asistenciaTexto}\n\n`;
    mensaje += `*Alimentación:*\n${alimentacion}`;
    
    // Campos opcionales (solo si tienen contenido)
    if (cancion && cancion.trim()) {
        mensaje += `\n\n*Canción sugerida:*\n${cancion.trim()}`;
    }
    
    if (mensajeExtra && mensajeExtra.trim()) {
        mensaje += `\n\n*Mensaje:*\n${mensajeExtra.trim()}`;
    }
    
    return mensaje;
}

/**
 * Inicializa el formulario RSVP
 */
function initRSVPForm() {
    const form = document.getElementById("rsvp-form");
    
    if (!form) {
        return;
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = {
            nombre: document.getElementById("rsvp-name").value,
            apellido: document.getElementById("rsvp-lastname").value,
            asistencia: document.getElementById("rsvp-attendance").value,
            alimentacion: document.getElementById("rsvp-food").value,
            cancion: document.getElementById("rsvp-song").value,
            mensajeExtra: document.getElementById("rsvp-message").value
        };
        
        // Validar campos requeridos
        if (!formData.nombre || !formData.apellido || !formData.asistencia) {
            alert("Por favor completá tu nombre, apellido y confirmá tu asistencia.");
            return;
        }
        
        // Generar mensaje premium
        const message = generateWhatsAppMessage(formData);
        
        // Codificar para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Construir URL de WhatsApp
        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        
        // Abrir WhatsApp
        window.open(whatsappURL, "_blank");
        
        console.log("✓ Mensaje de confirmación enviado a WhatsApp");
    });

    console.log("✓ Formulario RSVP inicializado");
}

// ============================================
// SCROLL SUAVE (NAVEGACIÓN)
// ============================================

/**
 * Inicializa el scroll suave para enlaces internos
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            
            // Ignorar si es solo "#"
            if (href === "#") return;

            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    console.log("✓ Scroll suave inicializado");
}

// ============================================
// ACCORDION (Paneles desplegables)
// ============================================

/**
 * Inicializa el sistema de accordion
 * Maneja la apertura/cierre con animaciones suaves
 */
function initAccordion() {
    const accordionItems = document.querySelectorAll(".accordion-item");
    
    if (accordionItems.length === 0) {
        console.log("⚠ No se encontraron accordions");
        return;
    }

    accordionItems.forEach(item => {
        const header = item.querySelector(".accordion-header");
        const content = item.querySelector(".accordion-content");
        
        if (!header || !content) return;

        // Evento click en el header
        header.addEventListener("click", function() {
            const isOpen = item.classList.contains("is-open");
            
            // Cerrar todos los demás accordions (comportamiento exclusivo)
            // Comentar las siguientes líneas si querés permitir múltiples abiertos
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains("is-open")) {
                    closeAccordion(otherItem);
                }
            });
            
            // Toggle del accordion actual
            if (isOpen) {
                closeAccordion(item);
            } else {
                openAccordion(item);
            }
        });

        // Soporte para teclado (accesibilidad)
        header.addEventListener("keydown", function(e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                header.click();
            }
        });
    });

    console.log("✓ Accordion inicializado:", accordionItems.length, "items");
}

/**
 * Abre un accordion con animación suave
 * @param {HTMLElement} item - El elemento accordion-item
 */
function openAccordion(item) {
    const content = item.querySelector(".accordion-content");
    const header = item.querySelector(".accordion-header");
    
    // Agregar clase para estilos
    item.classList.add("is-open");
    
    // Actualizar aria para accesibilidad
    header.setAttribute("aria-expanded", "true");
    
    // Calcular altura real del contenido
    const scrollHeight = content.scrollHeight;
    
    // Animar apertura
    content.style.maxHeight = scrollHeight + "px";
    
    // Después de la animación, permitir contenido dinámico
    setTimeout(() => {
        if (item.classList.contains("is-open")) {
            content.style.maxHeight = "none";
        }
    }, 400); // Duración de la transición CSS
}

/**
 * Cierra un accordion con animación suave
 * @param {HTMLElement} item - El elemento accordion-item
 */
function closeAccordion(item) {
    const content = item.querySelector(".accordion-content");
    const header = item.querySelector(".accordion-header");
    
    // Fijar altura actual antes de animar
    content.style.maxHeight = content.scrollHeight + "px";
    
    // Forzar reflow para que la transición funcione
    content.offsetHeight;
    
    // Animar cierre
    content.style.maxHeight = "0";
    
    // Quitar clase después de un pequeño delay
    setTimeout(() => {
        item.classList.remove("is-open");
        header.setAttribute("aria-expanded", "false");
    }, 50);
}

// ============================================
// ANIMACIONES AL SCROLL (OPCIONAL)
// ============================================

/**
 * Observador para animar elementos cuando entran en viewport
 * Usa Intersection Observer API (nativo)
 */
function initScrollAnimations() {
    // Verificar soporte
    if (!("IntersectionObserver" in window)) {
        console.log("⚠ IntersectionObserver no soportado");
        return;
    }

    const options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                // Dejar de observar después de animar
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Observar secciones (excepto hero)
    const sections = document.querySelectorAll("section:not(#hero), main");
    sections.forEach(section => {
        section.classList.add("fade-in-section");
        observer.observe(section);
    });

    console.log("✓ Animaciones de scroll inicializadas");
}

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================

/**
 * Función principal que inicializa todo cuando el DOM está listo
 */
function init() {
    console.log("═══════════════════════════════════════");
    console.log("   INVITACIÓN DIGITAL - XV AÑOS");
    console.log("═══════════════════════════════════════");

    // Inicializar componentes
    initCountdown();
    initAccordion();
    initRSVPForm();
    initCopyButtons();
    initSmoothScroll();
    initScrollAnimations();

    console.log("═══════════════════════════════════════");
    console.log("✓ Invitación cargada correctamente");
    console.log("═══════════════════════════════════════");
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    // DOM ya está listo
    init();
}
