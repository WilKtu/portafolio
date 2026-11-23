const L = {
  es: {
    home: "Inicio",
    about: "Sobre mí",
    projects: "Proyectos",
    cv: "CV",
    life: "Mi vida fuera del código",
    contact: "Contacto",
    role: "Técnico en Desarrollo de Software",
    hi: "Hola, soy",
    hero:
      "Me formo como desarrollador Full Stack con enfoque en bases de datos, backend y desarrollo web. Me gusta resolver problemas y construir soluciones ordenadas y funcionales.",
    seeP: "Ver proyectos",
    seeCV: "Ver CV",
    aboutT: "Sobre mí",
    a1:
      "Soy técnico en desarrollo de software, formado en Campuslands GT y residente en la Ciudad de Guatemala. Cuento con conocimientos en desarrollo de interfaces y componentes reutilizables, diseño y modelado de bases de datos, así como soporte técnico de equipos de cómputo.",
    a2:
      "Mi objetivo es consolidarme como desarrollador Full Stack, aportando soluciones eficientes, estructuradas y funcionales. Me caracterizo por mi disposición para aprender y mi compromiso con la calidad.",
    eduT: "Formación",
    e1: "Técnico en Desarrollo de Software — Campuslands GT (2026, en curso)",
    e2:
      "Bachillerato en Ciencias y Letras con orientación en computación — Villa de los Niños (2021–2025)",
    skT: "Habilidades",
    sk1: "Desarrollo web",
    sk2: "Bases de datos",
    sk3: "Backend y automatización",
    sk4: "Soporte técnico",
    sk4v: "Mantenimiento preventivo, instalación de Windows, diagnóstico de hardware",
    soft: "Habilidades adaptativas",
    softv: "Responsabilidad, resolución de problemas, trabajo en equipo, escucha activa",
    langT: "Idiomas",
    langv: "Español (nativo) · Inglés (A2)",
    projT: "Proyectos",
    projI: "Una selección de mis trabajos. Más en mi GitHub.",
    repo: "Ver repositorio",
    soon: "Repositorio próximamente",
    cvT: "Mi CV",
    cvP: "Puedes verlo aquí mismo o descargarlo.",
    dl: "Descargar CV (ES)",
    dl2: "Descargar CV (EN)",
    lifeT: "Mi vida fuera del código",
    lifeI:
      "Programar es parte de mi vida, pero no lo es todo. Esto es lo que disfruto en mi tiempo libre.",
    h1: "Fútbol",
    h1p: "Jugarlo y verlo: me ayuda a despejar la mente y a trabajar en equipo.",
    h2: "Lectura",
    h2p: "Me gustan la aventura y la historia. Algunas de mis referencias:",
    h3: "Ver anime",
    h3p: "Historias con mundos y personajes que me inspiran.",
    h4: "Videojuegos",
    h4p: "Mis favoritos para jugar:",
    ctT: "Contacto",
    ctP: "¿Hablamos? Escríbeme o encuéntrame en mis redes.",
    foot: "Hecho con HTML, CSS y JavaScript"
  },
  en: {
    home: "Home",
    about: "About me",
    projects: "Projects",
    cv: "CV",
    life: "Life outside code",
    contact: "Contact",
    role: "Software Development Technician",
    hi: "Hi, I'm",
    hero:
      "I'm training as a Full Stack developer focused on databases, backend and web development. I enjoy solving problems and building tidy, working solutions.",
    seeP: "See projects",
    seeCV: "View CV",
    aboutT: "About me",
    a1:
      "I am a software development technician trained at Campuslands GT and based in Guatemala City. I have knowledge of interface development and reusable components, database design and modeling, and computer technical support.",
    a2:
      "My goal is to become a Full Stack developer, delivering efficient, structured and functional solutions. I'm known for my willingness to learn and my commitment to quality.",
    eduT: "Education",
    e1: "Software Development Technician — Campuslands GT (2026, in progress)",
    e2:
      "High school diploma in Science and Letters, computing track — Villa de los Niños (2021–2025)",
    skT: "Skills",
    sk1: "Web development",
    sk2: "Databases",
    sk3: "Backend and automation",
    sk4: "Technical support",
    sk4v: "Preventive maintenance, Windows installation, hardware diagnostics",
    soft: "Soft skills",
    softv: "Responsibility, problem solving, teamwork, active listening",
    langT: "Languages",
    langv: "Spanish (native) · English (A2)",
    projT: "Projects",
    projI: "A selection of my work. More on my GitHub.",
    repo: "View repository",
    soon: "Repository coming soon",
    cvT: "My CV",
    cvP: "You can view it right here or download it.",
    dl: "Download CV (ES)",
    dl2: "Download CV (EN)",
    lifeT: "Life outside code",
    lifeI:
      "Coding is a big part of my life, but not all of it. Here's what I enjoy in my free time.",
    h1: "Football",
    h1p: "Playing and watching it: it clears my mind and teaches me teamwork.",
    h2: "Reading",
    h2p: "I enjoy adventure and history. Some of my references:",
    h3: "Watching anime",
    h3p: "Stories with worlds and characters that inspire me.",
    h4: "Video games",
    h4p: "My favorites to play:",
    ctT: "Contact",
    ctP: "Let's talk! Write to me or find me on my networks.",
    foot: "Built with HTML, CSS and JavaScript"
  }
};

const G = "https://github.com/WilKtu/";
const EM = "fernandocolaj7@gmail.com";
const LI = "https://www.linkedin.com/in/wilder-fernando-elias-catu-colaj-7a0a8a346";

const P = [
  {
    n: "Distribuidora de Gaseosas del Valle",
    u: G + "distribuidora-de-gaseosas-del-valle",
    t: ["MySQL"],
    es:
      "Sistema de gestión y ventas: productos, clientes, inventario, pedidos con IVA, múltiples sedes, auditoría de precios, triggers, vistas y un evento programado de reposición.",
    en:
      "Management and sales system: products, customers, inventory, orders with VAT, multiple branches, price auditing, triggers, views and a scheduled restocking event."
  },
  {
    n: "Garage Elite Campus",
    u: G + "garage_elite_campus",
    t: ["MySQL", "SQL"],
    es:
      "CRUD de citas de servicio con procedimientos almacenados, transacciones COMMIT/ROLLBACK, validaciones con SIGNAL SQLSTATE y borrado lógico y físico.",
    en:
      "Service-appointment CRUD built on stored procedures, COMMIT/ROLLBACK transactions, SIGNAL SQLSTATE validations and soft/hard deletes."
  },
  {
    n: "Sistema Experto — Diagnóstico de PC",
    u: G + "sistemas_expertos",
    t: ["Python"],
    es:
      "Sistema experto basado en reglas con motor de inferencia propio (backward chaining) para diagnosticar fallas de computadores.",
    en:
      "Rule-based expert system with its own inference engine (backward chaining) to diagnose computer faults."
  },
  {
    n: "API REST de librería",
    t: ["Node.js", "Express", "MySQL"],
    es:
      "API para una base de datos de libros (ventas y préstamos) con validaciones y CRUD.",
    en: "API for a book database (sales and loans) with validations and CRUD."
  },
  {
    n: "Gestor de gimnasio (CLI)",
    t: ["Node.js", "MySQL"],
    es:
      "App de consola para gestionar clientes y entrenadores de un gimnasio, aplicando SOLID y patrones de diseño.",
    en:
      "Console app to manage gym clients and personal trainers, applying SOLID and design patterns."
  },
  {
    n: "Sistema académico (CLI)",
    t: ["Node.js", "mysql2"],
    es: "CRUD en consola para estudiantes, profesores, cursos y horarios.",
    en: "Console CRUD for students, teachers, courses and schedules."
  }
];

const GM = [
  ["Call of Duty: Black Ops", "callofduty"],
  ["Gears of War", "gearsofware"],
  ["Blood Strike", "blood"],
  ["Minecraft", "minecratf"]
];

const BK = [
  ["Julio Verne", "julio"],
  ["Christopher Paolini — Eragon", "cristoper"],
  ["Choque de imperios: el gran asedio de Malta", "choque"]
];

