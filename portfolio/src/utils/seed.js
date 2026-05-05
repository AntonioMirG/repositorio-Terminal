import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";

const seedDatabase = async () => {
  try {
    // 1. Usuarios (Admin)
    await setDoc(doc(db, "usuarios", "admin_user"), {
      nombre: "Antonio Mir",
      email: "antoniomirdev@gmail.com",
      rol: "admin"
    });

    // 2. Contenido (About Me, Contact, etc.)
    await setDoc(doc(db, "contenido", "about"), {
      titulo: "Sobre Mí",
      texto: `Soy un Desarrollador Fullstack que busca crear soluciones sencillas y modernas.
1 año de experiencia con el stack MERN. Enfoque en clean code.
Apasionado por DevOps & Cloud, IA y Big Data.`
    });

    await setDoc(doc(db, "contenido", "contact"), {
      email: "antoniomirdev@gmail.com",
      github: "github.com/AntonioMirG",
      linkedin: "www.linkedin.com/in/antonio-mir-perez-1aa624309"
    });

    // 3. Proyectos (Usando IDs fijos para evitar duplicados si se corre varias veces)
    const proyectos = {
      "ecommerce": {
        nombre: "E-Commerce API",
        tech: "Node.js, Express, MongoDB, JWT",
        descripcion: "API REST completa para tienda online.",
        estado: "✅ En producción"
      },
      "terminal": {
        nombre: "Terminal Porfolio",
        tech: "React, Vite, CSS",
        descripcion: "¡Este proyecto! Porfolio interactivo con interfaz de terminal.",
        estado: "✅ Live"
      },
      "weather": {
        nombre: "Weather App",
        tech: "Vanilla JS, OpenWeather API, CSS",
        descripcion: "App del clima con geolocalización.",
        estado: "✅ Completado"
      }
    };

    for (const [id, data] of Object.entries(proyectos)) {
      await setDoc(doc(db, "proyectos", id), data);
    }

    // 4. Filesystem Virtual (Opcional: guardar todo el estado inicial)
    // await setDoc(doc(db, "config", "filesystem"), INITIAL_FILESYSTEM);

    console.log("¡Base de datos inicializada con éxito!");
    alert("¡Base de datos inicializada!");
  } catch (error) {
    console.error("Error al inicializar la base de datos: ", error);
    alert("Error al inicializar. Revisa la consola.");
  }
};

export default seedDatabase;
