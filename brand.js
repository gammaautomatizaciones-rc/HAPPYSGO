// Animación suave para letras del logo
document.addEventListener("DOMContentLoaded", () => {
    const letters = document.querySelectorAll(".logo-text span");

    letters.forEach((letter, index) => {
        letter.style.opacity = "0";
        letter.style.transform = "translateY(20px)";
        
        setTimeout(() => {
            letter.style.transition = "all 0.5s ease";
            letter.style.opacity = "1";
            letter.style.transform = "translateY(0)";
        }, 150 * index);
    });
});


// Hover elástico del logo
const logoText = document.querySelector(".logo-text");
if (logoText) {
    logoText.addEventListener("mouseenter", () => {
        logoText.style.transition = "transform .25s ease";
        logoText.style.transform = "scale(1.04)";
    });

    logoText.addEventListener("mouseleave", () => {
        logoText.style.transform = "scale(1)";
    });
}


// Aparecer suave del botón cuando está en viewport (scroll observers)
const btn = document.querySelector(".btn");

if (btn) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                btn.style.opacity = "1";
                btn.style.transform = "translateY(0)";
            }
        });
    });

    btn.style.opacity = "0";
    btn.style.transform = "translateY(20px)";
    observer.observe(btn);
}
