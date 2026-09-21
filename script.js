document.addEventListener("DOMContentLoaded", () => {
    // 1. Actualizar dinámicamente el año en el pie de página
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Menú Hamburguesa para dispositivos móviles
    const mobileMenu = document.getElementById("mobile-menu");
    const navLinks = document.getElementById("nav-links");

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            // Cambiar icono entre barras y X
            const icon = mobileMenu.querySelector("i");
            if (navLinks.classList.contains("active")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-times");
            } else {
                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");
            }
        });

        // Cerrar el menú al hacer clic en cualquier enlace
        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                const icon = mobileMenu.querySelector("i");
                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");
            });
        });
    }

    // 3. Efecto Header Scroll (Añade sombra y reduce tamaño al bajar)
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // 4. Efecto Scroll Reveal (Aparecer elementos de forma fluida al hacer scroll)
    const revealElements = document.querySelectorAll(".reveal");

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add("active");
            }
        });
    };

    // Ejecutar al cargar la página y al hacer scroll
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Comprobación inicial
});