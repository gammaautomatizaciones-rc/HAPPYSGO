const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSVD2iCdH4_pynOefXZ6gg_5UklL1C2q676plGTLxjmDQ18O6Pf_lo1NoJwrBaltEbVRxiLc2Wk1Qc3/pub?gid=0&single=true&output=csv";
const IMG_PATH = "img/";

let items = [];
let filtrados = [];
let selectHandlerAttached = false; // Bandera para asegurar que el listener del select se adjunte solo una vez

/**
 * 🍕 CARGAR CSV
 * Obtiene el CSV, lo parsea y llama a renderMenu.
 * Se ejecuta solo al cargar la página.
 */
async function cargarMenu() {
    try {
        console.log("Cargando menú desde Google Sheets...");
        // Usamos un timestamp para forzar la no-cache de los datos.
        const res = await fetch(SHEET_URL + "&t=" + Date.now(), { cache: "no-store" });
        
        if (!res.ok) {
            throw new Error(`Error al cargar el menú (HTTP ${res.status}): Asegúrate que la hoja esté publicada.`);
        }

        const csv = await res.text();
        // Papa Parse necesita estar incluido en tu HTML
        const parsed = Papa.parse(csv, { header: true });

        items = parsed.data
            .filter(row => (row.categoria || "").trim() && (row.nombre || "").trim())
            .map(row => ({
                categoria: (row.categoria || "").trim(),
                nombre: (row.nombre || "").trim(),
                precio: (row.precio || "").trim(),
                descripcion: (row.descripcion || "").trim(),
                imagen: (row.imagen || "").trim(),
                destacado: (row.destacado || "").trim().toLowerCase() === "si"
            }));

        filtrados = items;

        renderMenu();

    } catch (error) {
        console.error("❌ Fallo al obtener o parsear el menú:", error);
        const cont = document.getElementById("menu");
        if (cont) {
            cont.innerHTML = "<p class='error-mensaje'>No se pudo cargar el menú. Por favor, verifica la conexión.</p>";
        }
    }
}

/**
 * 🍔 FUNCIÓN DE RENDERIZADO
 */
function renderMenu() {
    const cont = document.getElementById("menu");
    if (!cont) return;
    
    // El select debe estar fuera del contenedor 'menu' para que no se borre
    const select = document.getElementById("categoriaSelect");
    
    // Limpiamos el contenedor del menú
    cont.innerHTML = "";

    const categorias = [...new Set(filtrados.map(i => i.categoria).filter(c => c))];

    // Re-renderizar las opciones del select
    if (select) {
        select.innerHTML = "<option value=''>Elegí una categoría</option>" +
            categorias.map(c => `<option value="${c}">${c}</option>`).join("");

        // Adjuntar el listener SÓLO una vez
        if (!selectHandlerAttached) {
            select.addEventListener("change", handleCategoryChange);
            selectHandlerAttached = true;
        }
    }

    // -------------------------------------------------------
    // CREACIÓN Y LLENADO DE SECCIONES
    // -------------------------------------------------------
    categorias.forEach(cat => {
        const cleanID = cat
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]/g, "");

        // 1. Crear la estructura de la sección
        const sectionHTML = `
            <div class='cat-section' id='sec-${cleanID}' style='display:none;'>
                <h2 class='categoria-titulo'>${cat}</h2>
                <div class='grid'></div>
            </div>
        `;
        cont.insertAdjacentHTML('beforeend', sectionHTML);

        const grid = document.querySelector(`#sec-${cleanID} .grid`);

        if (grid) {
            // 2. Llenar el grid
            filtrados
                .filter(i => i.categoria === cat)
                .forEach(i => {
                    const imgHTML = i.imagen
                        ? `<img src="${IMG_PATH}${i.imagen}" alt="${i.nombre}" onerror="this.style.display='none'">`
                        : "";
                    
                    const priceValue = Number(i.precio || 0);
                    const formattedPrice = isNaN(priceValue) ? 'Consultar' : priceValue.toLocaleString("es-AR", { minimumFractionDigits: 0 });

                    grid.innerHTML += `
                        <div class='card ${i.destacado ? 'destacado' : ''}'>
                            ${imgHTML}
                            <div class='texto'>
                                <h3>${i.nombre}</h3>
                                <p>${i.descripcion}</p>
                                <div class='precio'>$${formattedPrice}</div>
                            </div>
                        </div>
                    `;
                });
        }
    });
    
    // Función de manejo del evento de cambio del selector (separada para el listener único)
    function handleCategoryChange() {
        const cat = select.value;
        
        document.querySelectorAll(".cat-section").forEach(sec => sec.style.display = "none");

        if (!cat) return;
        
        const cleanID = cat
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]/g, "");

        const section = document.getElementById("sec-" + cleanID);
        if (section) {
            section.style.display = "block";
        }
    }
}


// ------------------------------------------------------------------
// 🚀 INICIALIZACIÓN (Se ejecuta solo al cargar la página)
// ------------------------------------------------------------------

cargarMenu();
