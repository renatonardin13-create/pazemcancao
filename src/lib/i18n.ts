import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "pt-BR": {
    translation: {
      "catalog": "Catálogo",
      "courses": "Cursos",
      "louvores": "Louvores",
      "ebooks": "E-books",
      "trilhas": "Trilhas",
      "perfil": "Perfil",
      "comunidade": "Comunidade",
      "lancamentos": "Lançamentos",
      "admin": "Admin",
      "logout": "Sair",
      "explore_by_category": "Explorar por categoria",
      "featured": "Em destaque",
      "all_products": "Todos os produtos",
      "search_placeholder": "O que você quer assistir hoje?",
      "select_language": "Selecionar Idioma",
      "continue_watching": "Continuar Assistindo",
      "no_content": "Nenhum conteúdo disponível no momento.",
      "restricted_access": "Acesso restrito"
    }
  },
  "en": {
    translation: {
      "catalog": "Catalog",
      "courses": "Courses",
      "louvores": "Praise",
      "ebooks": "E-books",
      "trilhas": "Tracks",
      "perfil": "Profile",
      "comunidade": "Community",
      "lancamentos": "Releases",
      "admin": "Admin",
      "logout": "Logout",
      "explore_by_category": "Explore by category",
      "featured": "Featured",
      "all_products": "All products",
      "search_placeholder": "What do you want to watch today?",
      "select_language": "Select Language",
      "continue_watching": "Continue Watching",
      "no_content": "No content available at the moment.",
      "restricted_access": "Restricted access"
    }
  },
  "es": {
    translation: {
      "catalog": "Catálogo",
      "courses": "Cursos",
      "louvores": "Alabanzas",
      "ebooks": "E-books",
      "trilhas": "Pistas",
      "perfil": "Perfil",
      "comunidade": "Comunidad",
      "lancamentos": "Lanzamientos",
      "admin": "Admin",
      "logout": "Cerrar sesión",
      "explore_by_category": "Explorar por categoría",
      "featured": "Destacado",
      "all_products": "Todos los productos",
      "search_placeholder": "¿Qué quieres ver hoy?",
      "select_language": "Seleccionar Idioma",
      "continue_watching": "Continuar Viendo",
      "no_content": "No hay contenido disponible en este momento.",
      "restricted_access": "Acceso restringido"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("app_language") || "pt-BR",
    fallbackLng: "pt-BR",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
