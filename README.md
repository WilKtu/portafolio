# Portafolio · Wilder Catú

Portafolio profesional multipágina (HTML, CSS y JavaScript puro, sin dependencias).
Tema oscuro estilo Matrix y claro suave · Español/Inglés · CV visible y descargable.

## Estructura
```
portafolio/
├── index.html · sobre-mi.html · proyectos.html · cv.html
├── vida-fuera-del-codigo.html · contacto.html
├── css/styles.css          # estilos y temas
├── js/main.js              # idioma, tema, textos ES/EN y lista de proyectos
├── assets/
│   ├── img/foto-wilder.jpg # foto retocada
│   ├── img/hobbies/        # imágenes de juegos/libros (opcional, ver abajo)
│   └── cv/                 # Wilder_Catu_CV_ES.pdf y Wilder_Catu_CV_EN.pdf
├── README.md · .gitignore · LICENSE
```
## Uso
Abre `index.html` en el navegador, o publícalo gratis con GitHub Pages
(Settings → Pages → rama `main`, carpeta `/root`).

## Personalizar
- **Proyectos:** edita el arreglo `P` en `js/main.js`.
- **Textos:** edita el objeto `L` (`es` y `en`) en `js/main.js`.
- **Imágenes de pasatiempos:** guarda archivos `.jpg` en `assets/img/hobbies/` con estos nombres:
  `cod-black-ops`, `gears-of-war`, `bloodstrike`, `minecraft`, `julio-verne`, `eragon`, `malta`.
  Si no existen, se muestra una tarjeta con la inicial.
