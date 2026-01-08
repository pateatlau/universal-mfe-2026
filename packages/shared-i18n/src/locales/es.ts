import type { Translations } from '../types';

/**
 * Spanish translations for the Universal Microfrontend Platform.
 *
 * Spanish uses the same plural categories as English:
 * - `one` - Singular (1)
 * - `other` - Plural (0, 2+)
 */
export const es: Translations = {
  common: {
    appName: 'Universal MFE',
    loading: 'Cargando...',
    loadingRemote: 'Cargando componente remoto...',
    loadRemote: 'Cargar Componente Remoto',
    subtitle: 'Cargando dinámicamente componente remoto vía Module Federation',
    subtitleMobile: 'Cargando dinámicamente remoto vía ScriptManager + MFv2',
    error: 'Ocurrió un error',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    clear: 'Limpiar',
    reset: 'Restablecer',
    yes: 'Sí',
    no: 'No',
    ok: 'OK',
    done: 'Hecho',
    welcome: 'Bienvenido',
    welcomeUser: '¡Bienvenido, {{name}}!',
    homeDescription: 'Explora la Plataforma Universal de Microfrontends',
    items: {
      zero: 'Sin elementos',
      one: '{{count}} elemento',
      other: '{{count}} elementos',
    },
    pressCount: {
      zero: 'Sin pulsaciones aún',
      one: 'Botón remoto pulsado {{count}} vez',
      other: 'Botón remoto pulsado {{count}} veces',
    },
    selected: {
      zero: 'Ninguno seleccionado',
      one: '{{count}} seleccionado',
      other: '{{count}} seleccionados',
    },
    lastUpdated: 'Última actualización {{date}}',
    createdBy: 'Creado por {{author}}',
    // Settings page section titles
    settings: {
      theme: 'Tema',
      language: 'Idioma',
    },
    // Navigation nested inside common (used via t('navigation.home') with namespace 'common')
    navigation: {
      title: 'Navegar',
      home: 'Inicio',
      settings: 'Configuración',
      remoteHello: 'Módulo Remoto',
      profile: 'Perfil',
      help: 'Ayuda',
      about: 'Acerca de',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      signUp: 'Registrarse',
      menu: 'Menú',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
    },
    // Theme nested inside common (used via t('theme.light') with namespace 'common')
    theme: {
      title: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
      toggle: 'Cambiar tema',
      currentTheme: 'Tema actual: {{theme}}',
    },
    // Language nested inside common (used via t('language.title') with namespace 'common')
    language: {
      title: 'Idioma',
      select: 'Seleccionar idioma',
      current: 'Idioma actual: {{language}}',
      english: 'Inglés',
      spanish: 'Español',
      french: 'Francés',
      german: 'Alemán',
      italian: 'Italiano',
      portuguese: 'Portugués',
      chinese: 'Chino',
      japanese: 'Japonés',
      korean: 'Coreano',
      arabic: 'Árabe',
    },
  },

  // Keep root-level navigation for backward compatibility
  navigation: {
    home: 'Inicio',
    settings: 'Configuración',
    profile: 'Perfil',
    help: 'Ayuda',
    about: 'Acerca de',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    signUp: 'Registrarse',
    menu: 'Menú',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
  },

  errors: {
    generic: 'Algo salió mal. Por favor, inténtalo de nuevo.',
    network: 'Error de red. Por favor, verifica tu conexión.',
    notFound: 'El recurso solicitado no fue encontrado.',
    unauthorized: 'No tienes autorización para ver este contenido.',
    forbidden: 'Acceso denegado.',
    serverError: 'Error del servidor. Por favor, inténtalo más tarde.',
    timeout: 'La solicitud expiró. Por favor, inténtalo de nuevo.',
    validation: 'Por favor, verifica tus datos e inténtalo de nuevo.',
    required: '{{field}} es obligatorio',
    invalidEmail: 'Por favor, introduce un correo electrónico válido',
    invalidPhone: 'Por favor, introduce un número de teléfono válido',
    passwordTooShort: 'La contraseña debe tener al menos {{min}} caracteres',
    passwordMismatch: 'Las contraseñas no coinciden',
    remoteLoadFailed: 'Error al cargar {{moduleName}}. Por favor, inténtalo de nuevo.',
    remoteTimeout: '{{moduleName}} tardó demasiado en cargar.',
  },

  accessibility: {
    skipToMain: 'Saltar al contenido principal',
    loading: 'Cargando, por favor espera',
    menuOpen: 'Menú abierto',
    menuClosed: 'Menú cerrado',
    expandedSection: '{{section}} expandido',
    collapsedSection: '{{section}} contraído',
    selectedItem: '{{item}} seleccionado',
    pageOf: 'Página {{current}} de {{total}}',
    resultsCount: {
      zero: 'No se encontraron resultados',
      one: '{{count}} resultado encontrado',
      other: '{{count}} resultados encontrados',
    },
  },

  theme: {
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    toggle: 'Cambiar tema',
    currentTheme: 'Tema actual: {{theme}}',
  },

  language: {
    select: 'Seleccionar idioma',
    current: 'Idioma actual: {{language}}',
    english: 'Inglés',
    spanish: 'Español',
    french: 'Francés',
    german: 'Alemán',
    italian: 'Italiano',
    portuguese: 'Portugués',
    chinese: 'Chino',
    japanese: 'Japonés',
    korean: 'Coreano',
    arabic: 'Árabe',
  },

  // HelloRemote MFE namespace
  hello: {
    greeting: '¡Hola desde Remoto!',
    greetingWithName: '¡Hola, {{name}}!',
    clickCount: {
      zero: 'Aún no has hecho clic',
      one: 'Hiciste clic {{count}} vez',
      other: 'Hiciste clic {{count}} veces',
    },
    buttonLabel: 'Hazme clic',
    buttonHint: 'Toca para incrementar el contador',
    description: 'Este componente se carga desde un microfrontend remoto.',
  },

  // Date/time formatting labels
  datetime: {
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    now: 'Ahora',
    justNow: 'Justo ahora',
    minutesAgo: {
      one: 'hace {{count}} minuto',
      other: 'hace {{count}} minutos',
    },
    hoursAgo: {
      one: 'hace {{count}} hora',
      other: 'hace {{count}} horas',
    },
    daysAgo: {
      one: 'hace {{count}} día',
      other: 'hace {{count}} días',
    },
    weeksAgo: {
      one: 'hace {{count}} semana',
      other: 'hace {{count}} semanas',
    },
    monthsAgo: {
      one: 'hace {{count}} mes',
      other: 'hace {{count}} meses',
    },
    yearsAgo: {
      one: 'hace {{count}} año',
      other: 'hace {{count}} años',
    },
    inMinutes: {
      one: 'en {{count}} minuto',
      other: 'en {{count}} minutos',
    },
    inHours: {
      one: 'en {{count}} hora',
      other: 'en {{count}} horas',
    },
    inDays: {
      one: 'en {{count}} día',
      other: 'en {{count}} días',
    },
  },
};
