// Importar Supabase desde el CDN oficial (requiere que el script sea de tipo module)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ⚠️ REEMPLAZA ESTOS DATOS CON LOS DE TU PROYECTO DE SUPABASE
const SUPABASE_URL = 'https://uvwljxqoeiaprryghgop.supabase.co/rest/v1/'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2d2xqeHFvZWlhcHJyeWdoZ29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDc3MzQsImV4cCI6MjEwNTU4MzczNH0.sNnogxdlSBHL8jyNfl-cEmL46kniVYzYqs7My9jugWE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Comprobación inicial

    // 5. Verificar si ya hay una sesión activa de Supabase al cargar la página
    verificarSesionActiva();
});

// --- FUNCIONES DE AUTENTICACIÓN Y SUPABASE ---

async function verificarSesionActiva() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        mostrarDashboard(session.user);
    }
}

window.registrarUsuario = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert("Por favor ingresa un correo y contraseña.");
        return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        alert('Error en registro: ' + error.message);
    } else {
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
    }
}

window.loginUsuario = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert("Por favor ingresa tu correo y contraseña.");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert('Error al iniciar sesión: ' + error.message);
    } else {
        mostrarDashboard(data.user);
    }
}

window.cerrarSesion = async () => {
    await supabase.auth.signOut();
    const authSection = document.getElementById('auth-section');
    const dashSection = document.getElementById('dashboard-section');
    if (authSection) authSection.style.display = 'block';
    if (dashSection) dashSection.style.display = 'none';
}

function mostrarDashboard(user) {
    const authSection = document.getElementById('auth-section');
    const dashSection = document.getElementById('dashboard-section');
    const emailDisplay = document.getElementById('user-email-display');

    if (authSection) authSection.style.display = 'none';
    if (dashSection) dashSection.style.display = 'block';
    if (emailDisplay) emailDisplay.innerText = user.email;
    
    cargarTickets(user.id);
}

// --- GESTIÓN DE TICKETS / POSVENTA ---

window.crearTicket = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const cliente_nombre = document.getElementById('cliente_nombre').value;
    const equipo_servicio = document.getElementById('equipo_servicio').value;
    const descripcion = document.getElementById('descripcion').value;

    const { error } = await supabase
        .from('tickets_posventa')
        .insert([{ 
            user_id: user.id, 
            cliente_nombre, 
            equipo_servicio, 
            descripcion, 
            estado: 'Pendiente' 
        }]);

    if (error) {
        alert('Error al crear el ticket: ' + error.message);
    } else {
        alert('¡Solicitud posventa enviada con éxito!');
        document.getElementById('ticket-form').reset();
        cargarTickets(user.id);
    }
}

async function cargarTickets(userId) {
    const contenedor = document.getElementById('lista-tickets');
    if (!contenedor) return;

    const { data, error } = await supabase
        .from('tickets_posventa')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    contenedor.innerHTML = '';

    if (error) {
        contenedor.innerHTML = '<p>Error al cargar las solicitudes.</p>';
        return;
    }

    if (data.length === 0) {
        contenedor.innerHTML = '<p>No tienes solicitudes posventa registradas.</p>';
        return;
    }

    data.forEach(ticket => {
        contenedor.innerHTML += `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 12px; border-radius: 6px; background: #fafafa;">
                <strong>Equipo / Sistema:</strong> ${ticket.equipo_servicio} <br>
                <strong>Cliente:</strong> ${ticket.cliente_nombre} <br>
                <strong>Descripción:</strong> ${ticket.descripcion} <br>
                <strong>Estado:</strong> <span style="color: #ff6b35; font-weight: bold;">${ticket.estado}</span>
            </div>
        `;
    });
}