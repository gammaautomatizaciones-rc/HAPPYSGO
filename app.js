const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSVD2iCdH4_pynOefXZ6gg_5UklL1C2q676plGTLxjmDQ18O6Pf_lo1NoJwrBaltEbVRxiLc2Wk1Qc3/pub?gid=0&single=true&output=csv";
const IMG_PATH = "img/";

let items = [];
let filtrados = [];

/**
 * 🍕 CARGAR CSV EN TIEMPO REAL
 * Obtiene el CSV, lo parsea y llama a renderMenu.
 */
async function cargarMenu() {
    try {
        // La nueva URL de publicación directa de Google Sheets ya es muy estable.
        // Agregamos un timestamp para forzar la no-cache, aunque la directiva 'no-store' también ayuda.
        const res = await fetch(SHEET_URL + "&t=" + Date.now(), { cache: "no-store" });
        
        if (!res.ok) {
            throw new Error(`Error al cargar el menú (HTTP ${res.status}): Asegúrate que la hoja esté publicada.`);
        }

        const csv = await res.text();

        // Papa Parse necesita ser incluido en tu HTML (ej: <script src="https://unpkg.com/papaparse@5.3.0/papaparse.min.js"></script>)
        const parsed = Papa.parse(csv, { header: true });

        items = parsed.data
            .filter(row => (row.categoria || "").trim() && (row.nombre || "").trim()) // Filtrar filas vacías o sin nombre/categoría
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
            cont.innerHTML = "<p class='error-mensaje'>No se pudo cargar el menú. Por favor, revisa la consola para más detalles o verifica la publicación del CSV.</p>";
        }
    }
}

/**
 * 🍔 RENDERIZAR EL MENÚ
 * Dibuja las categorías y los items en la página, y configura el selector.
 */
function renderMenu() {
    const cont = document.getElementById("menu");
    if (!cont) return; // Asegurarse de que el contenedor exista
    
    cont.innerHTML = "";

    // Obtener categorías únicas y filtrar cadenas vacías
    const categorias = [...new Set(filtrados.map(i => i.categoria).filter(c => c))];

    const select = document.getElementById("categoriaSelect");
    if (select) {
        select.innerHTML = "<option value=''>Elegí una categoría</option>" +
            categorias.map(c => `<option value="${c}">${c}</option>`).join("");
            
        // Limpiar listeners antiguos antes de añadir uno nuevo (si fuera necesario en re-renders)
        select.replaceWith(select.cloneNode(true));
        const newSelect = document.getElementById("categoriaSelect");

        newSelect.addEventListener("change", () => {
            const cat = newSelect.value;
            
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
        });
    }


    categorias.forEach(cat => {
        const cleanID = cat
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]/g, "");

        // Creación de la sección de categoría (Mejor usar createElement/appendChild, pero mantengo innerHTML por simplicidad)
        cont.innerHTML += `
            <div class='cat-section' id='sec-${cleanID}' style='display:none;'>
                <h2 class='categoria-titulo'>${cat}</h2>
                <div class='grid'></div>
            </div>
        `;

        // Obtener el grid del elemento recién añadido
        const grid = document.querySelector(`#sec-${cleanID} .grid`);

        if (grid) {
            filtrados
                .filter(i => i.categoria === cat)
                .forEach(i => {
                    const imgHTML = i.imagen
                        ? `<img src="${IMG_PATH}${i.imagen}" alt="${i.nombre}" onerror="this.style.display='none'">`
                        : "";
                    
                    // Formatear precio de manera segura
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

    // Mostrar todo por defecto si no hay select (o si quieres que se muestre todo al cargar)
    if (cont.children.length > 0 && (!select || !select.value)) {
        // En este caso, el comportamiento original es ocultar todo y esperar la selección.
        // Si quieres que la primera categoría se muestre al cargar, descomenta:
        // document.querySelector(".cat-section").style.display = "block";
    }
}

// Inicializar la carga del menú al cargar el script
cargarMenu();
