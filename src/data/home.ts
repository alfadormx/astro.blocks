export interface HomeItemCopy {
  title: string;
  lead: string;
}

export interface HomeCopy {
  pageTitle: string;
  headerDocsLabel: string;
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
    browseDocsLabel: string;
    viewSourceLabel: string;
  };
  inside: {
    tagline: string;
    title: string;
    subtitle: string;
    primitives: HomeItemCopy;
    composites: HomeItemCopy;
    layout: HomeItemCopy;
  };
  getStarted: {
    tagline: string;
    title: string;
    subtitle: string;
    openDocsLabel: string;
  };
  footerDisclaimer: string;
}

export const homeCopy: Record<string, HomeCopy> = {
  en: {
    pageTitle: 'Astro Blocks',
    headerDocsLabel: 'Documentation',
    hero: {
      tagline: 'Component Library',
      title: 'Astro Blocks',
      subtitle:
        'Composable UI components built with Astro and Tailwind CSS. Pick, customize, ship.',
      browseDocsLabel: 'Browse Documentation',
      viewSourceLabel: 'View Source',
    },
    inside: {
      tagline: "What's Inside",
      title: 'Three layers of components',
      subtitle:
        'From atomic primitives to fully assembled sections — everything composable, nothing opinionated.',
      primitives: {
        title: 'Primitives',
        lead: 'Atomic building blocks',
      },
      composites: {
        title: 'Composites',
        lead: 'Pre-assembled sections',
      },
      layout: {
        title: 'Layout',
        lead: 'Structural containers',
      },
    },
    getStarted: {
      tagline: 'Get Started',
      title: 'Ready to build?',
      subtitle: 'Explore the full component reference with live usage examples.',
      openDocsLabel: 'Open Documentation',
    },
    footerDisclaimer: 'Astro Blocks — open-source component library. Not for commercial use.',
  },
  es: {
    pageTitle: 'Componentes Astro',
    headerDocsLabel: 'Documentación',
    hero: {
      tagline: 'Biblioteca de componentes',
      title: 'Astro Blocks',
      subtitle:
        'Componentes de interfaz combinables creados con Astro y Tailwind CSS. Elige, personaliza, publica.',
      browseDocsLabel: 'Ver documentación',
      viewSourceLabel: 'Ver código fuente',
    },
    inside: {
      tagline: 'Qué incluye',
      title: 'Tres capas de componentes',
      subtitle: 'De primitivas atómicas a secciones completas: todo combinable, nada impuesto.',
      primitives: {
        title: 'Primitivas',
        lead: 'Piezas básicas',
      },
      composites: {
        title: 'Compuestos',
        lead: 'Secciones preensambladas',
      },
      layout: {
        title: 'Maquetación',
        lead: 'Contenedores estructurales',
      },
    },
    getStarted: {
      tagline: 'Empieza',
      title: '¿Listo para construir?',
      subtitle: 'Explora la referencia completa de componentes con ejemplos en vivo.',
      openDocsLabel: 'Abrir documentación',
    },
    footerDisclaimer:
      'Astro Blocks — biblioteca de componentes de código abierto. No apta para uso comercial.',
  },
};
