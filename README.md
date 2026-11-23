# Portafolio · Wilder Catú

Portafolio profesional convertido en un **mundo interactivo inspirado en la mecánica de Slither.io**:
una serpiente representa al desarrollador y el entorno representa sus habilidades, proyectos y trayectoria.
HTML5 + CSS3 + JavaScript puro, sin frameworks, sin librerías y sin build. Compatible con GitHub Pages.

## Probar en local
Abre `index.html` directamente o, mejor, sirve la carpeta:
```
python -m http.server 8000     # y visita http://localhost:8000
```
Publicación: GitHub Pages → rama `main`, carpeta `/root`. Todas las rutas son relativas.

## Estructura
```
portafolio/
├── index.html                  # mundo interactivo (y todo el contenido como HTML semántico)
├── sobre-mi · proyectos · cv · vida-fuera-del-codigo · contacto .html   # versión clásica multipágina (se conserva)
├── css/
│   ├── base.css                # tokens, tipografía, botones, tarjetas, accesibilidad
│   ├── world.css               # canvas, HUD, dock, paneles, modal, toast, modo texto
│   ├── animations.css          # keyframes y modo calmo / prefers-reduced-motion
│   ├── responsive.css          # adaptaciones escritorio / tablet / móvil
│   └── styles.css              # estilos de la versión clásica (sin cambios)
├── js/
│   ├── data.js                 # ÚNICA fuente de contenido (textos ES/EN, proyectos, libros, juegos, enlaces)
│   ├── responsive.js           # dispositivo, calidad (gama baja/media/alta), DPR, resize
│   ├── particles.js            # partículas coleccionables, chispas y ondas (Canvas, sprites)
│   ├── snake.js                # movimiento, crecimiento y dibujo de la serpiente
│   ├── world.js                # tamaño del mundo, zonas, cuadrícula, estrellas
│   ├── navigation.js           # idioma, paneles, dock, indicador de zona, modo texto/calmo
│   ├── interactions.js         # puntos de interés, detección, toast y ventanas modales
│   ├── app.js                  # bucle rAF, entrada mouse/táctil/teclado, cámara, minimapa
│   └── main.js                 # lógica de la versión clásica
└── assets/ (img, cv)
```

## Mecánicas
- **Mouse:** la serpiente sigue el cursor; mantener clic = acelerar.
- **Táctil:** joystick flotante (arrastra el dedo) + botón ⚡; tocar un punto de interés lo abre.
- **Teclado:** flechas/WASD, Shift acelera, Enter abre el punto cercano, Esc cierra.
- **Partículas:** se recogen, dan energía y la serpiente crece visualmente.
- **Zonas:** Inicio, Sobre mí, Habilidades, Proyectos, Formación y CV, Vida fuera del código, Contacto.
  Al permanecer en una zona se abre su panel; el indicador superior y el minimapa muestran dónde estás.
- **Navegación convencional:** menú lateral/inferior siempre visible, `#hash` por sección,
  **Modo texto** (sin canvas, todas las secciones apiladas) y enlace a la **versión clásica**.

## Personalizar
- **Proyectos / textos / hobbies:** edita `js/data.js` (la versión clásica y el mundo lo comparten).
- **Posición de zonas:** `js/world.js`.

## Accesibilidad y rendimiento
Contenido real en el DOM (lectores de pantalla), foco visible, diálogo con trampa de foco, botón *Pausar animaciones*
y respeto de `prefers-reduced-motion`. Un único `<canvas>`, `requestAnimationFrame`, sprites pre-renderizados,
culling fuera de pantalla, nº de partículas y DPR según la capacidad del dispositivo, pausa con pestaña oculta.

## Limitaciones
- El tema claro/oscuro y el fondo Matrix siguen existiendo solo en la versión clásica; el mundo es oscuro.
- Las habilidades no tienen nivel ni descripción individual en el contenido original, por lo que no se muestran.
- Los proyectos no tienen imagen ni demo original; la ventana usa una portada generada con las iniciales (sin inventar datos).
