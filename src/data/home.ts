export interface HomeItemCopy {
  title: string;
  content: string;
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
        content:
          'Atomic building blocks: Button, Headline, Image, Video, Map, ModelViewer, Logo, Vector, ThemeToggle, LanguageToggle, ToggleGroup, TextArea.',
      },
      composites: {
        title: 'Composites',
        content:
          'Pre-assembled sections: Header, Footer, Content, ItemsGrid, ContentCarousel, NavigationTree and more.',
      },
      layout: {
        title: 'Layout',
        content:
          'Structural containers: Container, TwoColumn, ThreeColumn, FourColumn, Sidebar variants, Modal.',
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
        content:
          'Piezas básicas: Button, Headline, Image, Video, Map, ModelViewer, Logo, Vector, ThemeToggle, LanguageToggle, ToggleGroup, TextArea.',
      },
      composites: {
        title: 'Compuestos',
        content:
          'Secciones preensambladas: Header, Footer, Content, ItemsGrid, ContentCarousel, NavigationTree y más.',
      },
      layout: {
        title: 'Maquetación',
        content:
          'Contenedores estructurales: Container, TwoColumn, ThreeColumn, FourColumn, variantes Sidebar, Modal.',
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
