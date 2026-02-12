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
 * Obtiene la fecha del evento desde EVENT_DATA
 * Si no existe, usa una fecha por defecto
 * @returns {Date} Fecha del evento
 */
function getEventDate() {
    if (typeof EVENT_DATA !== "undefined" && EVENT_DATA.countdownDate) {
        return new Date(EVENT_DATA.countdownDate);
    }
    return new Date("2026-10-15T21:00:00");
}

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
    const eventDate = getEventDate();
    const eventTime = eventDate.getTime();
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
    console.log("📅 Fecha del evento:", getEventDate().toLocaleString("es-AR", {
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
            // Primero intenta data-copy-from (dinámico desde EVENT_DATA)
            const dataPath = this.getAttribute("data-copy-from");
            let textToCopy = this.getAttribute("data-copy");
            
            if (dataPath && typeof EVENT_DATA !== "undefined") {
                // Obtener valor desde EVENT_DATA usando la ruta (ej: "regalos.alias")
                textToCopy = getNestedValue(EVENT_DATA, dataPath) || textToCopy;
            }
            
            if (textToCopy) {
                copyToClipboard(textToCopy, this);
            }
        });
    });

    if (copyButtons.length > 0) {
        console.log("✓ Botones de copiar inicializados:", copyButtons.length);
    }
}

/**
 * Obtiene un valor anidado de un objeto usando notación de punto
 * @param {Object} obj - Objeto fuente
 * @param {string} path - Ruta al valor (ej: "lugar.nombre")
 * @returns {*} Valor encontrado o undefined
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

// ============================================
// FORMULARIO RSVP - WHATSAPP
// ============================================

/**
 * Obtiene el número de WhatsApp para confirmaciones desde EVENT_DATA
 * @returns {string} Número de WhatsApp
 */
function getWhatsAppNumber() {
    if (typeof EVENT_DATA !== "undefined" && EVENT_DATA.confirmacion && EVENT_DATA.confirmacion.telefono) {
        return EVENT_DATA.confirmacion.telefono;
    }
    return "5491100000000"; // Número por defecto
}

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
        
        // Construir URL de WhatsApp (número desde EVENT_DATA)
        const whatsappURL = `https://wa.me/${getWhatsAppNumber()}?text=${encodedMessage}`;
        
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

// ============================================
// HERO CON IMAGEN DE FONDO
// ============================================

/**
 * Aplica la imagen de fondo al hero desde data.js
 */
function initHeroImage() {
    if (typeof EVENT_DATA === "undefined" || !EVENT_DATA.heroImage) {
        console.log("⚠ No se encontró imagen para el hero");
        return;
    }
    
    const hero = document.getElementById("hero");
    if (hero) {
        hero.style.backgroundImage = `url(${EVENT_DATA.heroImage})`;
        console.log("✓ Imagen del hero aplicada");
    }
}

// ============================================
// INYECCIÓN DE DATOS DINÁMICOS
// ============================================

/**
 * Inyecta todos los datos del evento desde EVENT_DATA al HTML
 * Busca elementos con atributo data-event y reemplaza su contenido
 */
function initEventData() {
    if (typeof EVENT_DATA === "undefined") {
        console.log("⚠ No se encontró EVENT_DATA");
        return;
    }

    // Inyectar textos en elementos con data-event
    const elements = document.querySelectorAll("[data-event]");
    elements.forEach(el => {
        const path = el.getAttribute("data-event");
        const value = getNestedValue(EVENT_DATA, path);
        if (value !== undefined) {
            el.textContent = value;
        }
    });

    // Actualizar link de Google Maps
    const mapsLink = document.getElementById("maps-link");
    if (mapsLink && EVENT_DATA.lugar && EVENT_DATA.lugar.maps) {
        mapsLink.href = EVENT_DATA.lugar.maps;
    }

    // Actualizar título de la página
    if (EVENT_DATA.tipoEvento && EVENT_DATA.nombre) {
        document.title = `${EVENT_DATA.tipoEvento} - ${EVENT_DATA.nombre}`;
    }

    console.log("✓ Datos del evento inyectados");
    console.log("  → Tipo:", EVENT_DATA.tipoEvento);
    console.log("  → Nombre:", EVENT_DATA.nombre);
    console.log("  → Fecha:", EVENT_DATA.fecha);
}

// ============================================
// CARRUSEL DE FOTOS
// ============================================

/**
 * Inicializa el carrusel de fotos con loop infinito real
 * - Clona primera imagen al final y última al inicio
 * - Autoplay con pausa en interacción
 * - Swipe en mobile, hover pause en desktop
 */
function initCarousel() {
    if (typeof EVENT_DATA === "undefined" || !EVENT_DATA.galleryImages) {
        console.log("⚠ No se encontraron imágenes para el carrusel");
        return;
    }
    
    const track = document.getElementById("carousel-track");
    const gallery = document.getElementById("gallery");
    
    if (!track || !gallery) return;
    
    const images = EVENT_DATA.galleryImages;
    const totalImages = images.length;
    const TRANSITION_DURATION = 600; // 0.6s
    const AUTOPLAY_INTERVAL = 4000;  // 4s
    
    // ===== CREAR SLIDES CON CLONES =====
    // Estructura: [clon última] [imagen 1] [imagen 2] ... [imagen N] [clon primera]
    
    // Clon de la última imagen al inicio
    const firstClone = document.createElement("div");
    firstClone.className = "carousel-slide carousel-clone";
    firstClone.innerHTML = `<img src="${images[totalImages - 1]}" alt="Foto clon" loading="lazy">`;
    track.appendChild(firstClone);
    
    // Imágenes originales
    images.forEach((src, index) => {
        const slide = document.createElement("div");
        slide.className = "carousel-slide";
        slide.innerHTML = `<img src="${src}" alt="Foto ${index + 1}" loading="lazy">`;
        track.appendChild(slide);
    });
    
    // Clon de la primera imagen al final
    const lastClone = document.createElement("div");
    lastClone.className = "carousel-slide carousel-clone";
    lastClone.innerHTML = `<img src="${images[0]}" alt="Foto clon" loading="lazy">`;
    track.appendChild(lastClone);
    
    // ===== VARIABLES =====
    let currentIndex = 1; // Empezar en la primera imagen real (índice 1)
    let isTransitioning = false;
    let isInteracting = false;
    let autoplayTimer = null;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    
    // ===== FUNCIONES AUXILIARES =====
    
    // Obtener ancho de slide + gap
    function getSlideWidth() {
        const slide = track.querySelector(".carousel-slide");
        if (!slide) return 300;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap) || 16;
        return slide.offsetWidth + gap;
    }
    
    // Posicionar track sin animación
    function setPositionInstant(index) {
        track.style.transition = "none";
        const slideWidth = getSlideWidth();
        currentTranslate = -index * slideWidth;
        track.style.transform = `translateX(${currentTranslate}px)`;
        prevTranslate = currentTranslate;
    }
    
    // Mover a slide con animación
    function goToSlide(index) {
        if (isTransitioning) return;
        
        isTransitioning = true;
        const slideWidth = getSlideWidth();
        
        track.style.transition = `transform ${TRANSITION_DURATION}ms ease`;
        currentTranslate = -index * slideWidth;
        track.style.transform = `translateX(${currentTranslate}px)`;
        prevTranslate = currentTranslate;
        currentIndex = index;
    }
    
    // Manejar fin de transición (loop infinito)
    function handleTransitionEnd() {
        isTransitioning = false;
        
        // Si llegó al clon final (después de la última imagen real)
        if (currentIndex >= totalImages + 1) {
            currentIndex = 1;
            setPositionInstant(currentIndex);
        }
        
        // Si llegó al clon inicial (antes de la primera imagen real)
        if (currentIndex <= 0) {
            currentIndex = totalImages;
            setPositionInstant(currentIndex);
        }
    }
    
    // ===== NAVEGACIÓN =====
    
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }
    
    function prevSlide() {
        goToSlide(currentIndex - 1);
    }
    
    // ===== AUTOPLAY =====
    
    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => {
            if (!isInteracting && !isDragging) {
                nextSlide();
            }
        }, AUTOPLAY_INTERVAL);
    }
    
    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }
    
    function pauseAutoplay() {
        isInteracting = true;
    }
    
    function resumeAutoplay() {
        isInteracting = false;
    }
    
    // ===== EVENTOS =====
    
    // Transición completada
    track.addEventListener("transitionend", handleTransitionEnd);
    
    // Hover pause (desktop)
    gallery.addEventListener("mouseenter", pauseAutoplay);
    gallery.addEventListener("mouseleave", resumeAutoplay);
    
    // Touch/Swipe (mobile)
    track.addEventListener("touchstart", (e) => {
        if (isTransitioning) return;
        pauseAutoplay();
        isDragging = true;
        startX = e.touches[0].clientX;
        track.style.transition = "none";
    }, { passive: true });
    
    track.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
    }, { passive: true });
    
    track.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;
        
        const slideWidth = getSlideWidth();
        const movedBy = currentTranslate - prevTranslate;
        
        // Si movió más del 25% del slide, cambiar
        if (Math.abs(movedBy) > slideWidth * 0.25) {
            if (movedBy < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            // Volver a posición actual
            goToSlide(currentIndex);
        }
        
        setTimeout(resumeAutoplay, 1500);
    });
    
    // Mouse drag (desktop)
    track.addEventListener("mousedown", (e) => {
        if (isTransitioning) return;
        pauseAutoplay();
        isDragging = true;
        startX = e.clientX;
        track.style.transition = "none";
        track.style.cursor = "grabbing";
    });
    
    track.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const currentX = e.clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
    });
    
    track.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = "grab";
        
        const slideWidth = getSlideWidth();
        const movedBy = currentTranslate - prevTranslate;
        
        if (Math.abs(movedBy) > slideWidth * 0.25) {
            if (movedBy < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            goToSlide(currentIndex);
        }
        
        setTimeout(resumeAutoplay, 1500);
    });
    
    track.addEventListener("mouseleave", () => {
        if (isDragging) {
            isDragging = false;
            track.style.cursor = "grab";
            goToSlide(currentIndex);
        }
    });
    
    // Prevenir drag de imágenes
    track.addEventListener("dragstart", (e) => e.preventDefault());
    
    // Mouse drag (desktop)
    track.addEventListener("mousedown", (e) => {
        pauseAutoplay();
        isDragging = true;
        startX = e.clientX;
        track.style.transition = "none";
        track.style.cursor = "grabbing";
    });
    
    track.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const currentX = e.clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
    });
    
    track.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = "grab";
        
        const slideWidth = getSlideWidth();
        const movedBy = currentTranslate - prevTranslate;
        
        if (Math.abs(movedBy) > slideWidth * 0.2) {
            if (movedBy < 0) {
                goToSlide(currentIndex + 1);
            } else if (currentIndex > 0) {
                goToSlide(currentIndex - 1);
            } else {
                goToSlide(currentIndex);
            }
        } else {
            goToSlide(currentIndex);
        }
        
        setTimeout(resumeAutoplay, 1000);
    });
    
    track.addEventListener("mouseleave", () => {
        if (isDragging) {
            isDragging = false;
            track.style.cursor = "grab";
            goToSlide(currentIndex);
        }
    });
    
    // Prevenir drag de imágenes
    track.addEventListener("dragstart", (e) => e.preventDefault());
    
    // Recalcular en resize
    window.addEventListener("resize", () => {
        setPositionInstant(currentIndex);
    });
    
    // ===== INICIALIZACIÓN =====
    // Posicionar en el primer slide real (índice 1, después del clon)
    setPositionInstant(1);
    track.style.cursor = "grab";
    
    // Iniciar autoplay
    startAutoplay();
    console.log("✓ Carrusel infinito inicializado:", totalImages, "imágenes + 2 clones");
}

/**
 * Función principal que inicializa todo cuando el DOM está listo
 */
/**
 * Función principal que inicializa todos los componentes del sitio
 * Se ejecuta después de cargar los datos del evento
 */
function initSite() {
    console.log("═══════════════════════════════════════");
    console.log("   INVITACIÓN DIGITAL");
    console.log("═══════════════════════════════════════");

    // Inicializar componentes
    initEventData();      // Inyectar datos dinámicos primero
    initHeroImage();
    initCarousel();
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

// ============================================
// CARGA DINÁMICA POR URL
// ============================================

/**
 * Obtiene el parámetro 'evento' de la URL
 * @returns {string|null} Nombre del evento o null
 */
function getEventoFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("evento");
}

/**
 * Muestra mensaje de error cuando no hay evento especificado
 */
function showErrorMessage(message) {
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-family: 'Poppins', sans-serif;
            text-align: center;
            padding: 2rem;
        ">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5; margin-bottom: 1.5rem;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">
                ${message}
            </h1>
            <p style="opacity: 0.7; font-size: 0.9rem; max-width: 400px;">
                Accedé a través del link que recibiste en tu invitación.
            </p>
            <p style="opacity: 0.5; font-size: 0.8rem; margin-top: 2rem;">
                Ejemplo: ?evento=sofia
            </p>
        </div>
    `;
}

/**
 * Carga dinámicamente el archivo de datos del evento
 * @param {string} evento - Nombre del evento
 */
function loadEventData(evento) {
    const script = document.createElement("script");
    script.src = `data/${evento}.js`;
    
    script.onload = function() {
        console.log(`✓ Datos del evento "${evento}" cargados`);
        initSite();
    };
    
    script.onerror = function() {
        console.error(`✗ No se encontró el evento: ${evento}`);
        showErrorMessage(`Evento "${evento}" no encontrado`);
    };
    
    document.head.appendChild(script);
}

/**
 * Inicialización principal
 * Lee el parámetro URL y carga los datos correspondientes
 */
function bootstrap() {
    let evento = getEventoFromURL();

    // Si no hay evento, usar demo por defecto
    if (!evento) {
        evento = "demo";
    }

    // Validar formato seguro
    if (!/^[a-zA-Z0-9_-]+$/.test(evento)) {
        showErrorMessage("Evento inválido");
        return;
    }

    console.log(`📋 Cargando evento: ${evento}`);
    loadEventData(evento);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
} else {
    bootstrap();
}
