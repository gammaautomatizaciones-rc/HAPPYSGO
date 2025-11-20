const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSVD2iCdH4_pynOefXZ6gg_5UklL1C2q676plGTLxjmDQ18O6Pf_lo1NoJwrBaltEbVRxiLc2Wk1Qc3/pub?gid=0&single=true&output=csv";
const IMG_PATH = "img/";

let items = [];
let filtrados = [];

// Asegúrate de incluir Papa Parse en tu HTML
// <script src="https://unpkg.com/papaparse@5.3.0/papaparse.min.js"></script>

/**
 * 🍕 CARGAR CSV EN TIEMPO REAL
 * Obtiene el CSV, lo parsea y llama a renderMenu.
 */
async function cargarMenu() {
    try {
        // La URL del CSV tiene un timestamp para evitar la caché de los datos (lo cual ya hacías).
        const res = await fetch(SHEET_URL + "&t=" + Date.now(), { cache: "no-store" });
        
        if (!res.ok) {
            throw new Error(`Error al cargar el menú (HTTP ${res.status}): Asegúrate que la hoja esté publicada.`);
        }

        const csv = await res.text();
        
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
            cont.innerHTML = "<p class='error-mensaje'>No se pudo cargar el menú. Por favor, verifica la conexión o la publicación del CSV.</p>";
        }
    }
}

/**
 * 🍔 RENDERIZAR EL MENÚ
 * Dibuja las categorías y los items en la página, y configura el selector.
 */
function renderMenu() {
    const cont = document.getElementById("menu");
    if (!cont) return;
    
    // Usamos temporalmente una copia del select para reasignar el listener
    const select = document.getElementById("categoriaSelect");
    
    // Si el select existe, lo clonamos antes de vaciar el contenedor principal para preservar el listener
    if (select) {
        select.removeEventListener("change", handleCategoryChange);
        select.innerHTML = "";
    }
    
    cont.innerHTML = "";

    const categorias = [...new Set(filtrados.map(i => i.categoria).filter(c => c))];

    if (select) {
        select.innerHTML = "<option value=''>Elegí una categoría</option>" +
            categorias.map(c => `<option value="${c}">${c}</option>`).join("");
            
        select.addEventListener("change", handleCategoryChange);
    }

    categorias.forEach(cat => {
        const cleanID = cat
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]/g, "");

        cont.innerHTML += `
            <div class='cat-section' id='sec-${cleanID}' style='display:none;'>
                <h2 class='categoria-titulo'>${cat}</h2>
                <div class='grid'></div>
            </div>
        `;

        const grid = document.querySelector(`#sec-${cleanID} .grid`);

        if (grid) {
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

    // Función para manejar el evento de cambio del selector
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

// Inicializar la carga del menú al cargar el script
cargarMenu();
