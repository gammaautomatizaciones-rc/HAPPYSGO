const SHEET_URL = "https://docs.google.com/spreadsheets/d/1vSVD2iCdH4_pynOefXZ6gg_5UklL1C2q676plGTLxjmDQ18O6Pf_lo1NoJwrBaltEbVRxiLc2Wk1Qc3/gviz/tq?tqx=out:csv";
const IMG_PATH = "img/";

let items = [];
let filtrados = [];

// CARGAR CSV EN TIEMPO REAL
async function cargarMenu() {
const res = await fetch(SHEET_URL + "&t=" + Date.now(), { cache: "no-store" });
const csv = await res.text();

const parsed = Papa.parse(csv, { header: true });

items = parsed.data.map(row => ({
    categoria: (row.categoria || "").trim(),
    nombre: (row.nombre || "").trim(),
    precio: (row.precio || "").trim(),
    descripcion: (row.descripcion || "").trim(),
    imagen: (row.imagen || "").trim(),
    destacado: (row.destacado || "").trim().toLowerCase() === "si"
}));

filtrados = items;

renderMenu();


}

function renderMenu() {
const cont = document.getElementById("menu");
cont.innerHTML = "";

const categorias = [...new Set(filtrados.map(i => i.categoria))];

const select = document.getElementById("categoriaSelect");
select.innerHTML = "<option value=''>Elegí una categoría</option>" +
    categorias.map(c => "<option value='" + c + "'>" + c + "</option>").join("");

categorias.forEach(cat => {
    const cleanID = cat
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, "");

    cont.innerHTML +=
        "<div class='cat-section' id='sec-" + cleanID + "' style='display:none;'>" +
            "<h2 class='categoria-titulo'>" + cat + "</h2>" +
            "<div class='grid'></div>" +
        "</div>";

    const grid = document.querySelector("#sec-" + cleanID + " .grid");

    filtrados
        .filter(i => i.categoria === cat)
        .forEach(i => {
            const imgHTML = i.imagen
                ? "<img src='" + IMG_PATH + i.imagen + "' onerror=\"this.style.display='none'\">"
                : "";

            grid.innerHTML +=
                "<div class='card'>" +
                    imgHTML +
                    "<div class='texto'>" +
                        "<h3>" + i.nombre + "</h3>" +
                        "<p>" + i.descripcion + "</p>" +
                        "<div class='precio'>$" + Number(i.precio || 0).toLocaleString("es-AR") + "</div>" +
                    "</div>" +
                "</div>";
        });
});

select.addEventListener("change", () => {
    const cat = select.value;

    document.querySelectorAll(".cat-section").forEach(sec => sec.style.display = "none");

    if (!cat) return;

    const cleanID = cat
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, "");

    document.getElementById("sec-" + cleanID).style.display = "block";
});


}

cargarMenu();
