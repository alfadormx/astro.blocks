# SaaS landing

Driftwave is a fictional product analytics company, and its landing page is one of the demo sites built only from this library. This guide walks the page from top to bottom and pulls each section apart into the blocks it is made of, so you can see which block does what and which few props give the page its look. Open the live demo beside it as you read.

<!-- mdx
import ItemsGrid from '@alfadormx/blocks/composite/ItemsGrid.astro';

<ItemsGrid
  columns={2}
  gap="tight"
  class="mb-12"
  defaultItemConfig={{
    orientation: 'horizontal',
    class: 'h-full',
    contentClass: 'w-full h-full',
    actionsClass: 'mt-0 md:mt-0 h-full',
    defaultActionConfig: {
      variant: 'outline',
      intent: 'neutral',
      width: 'full',
      class: 'h-full items-start justify-start text-left font-normal',
      labelClass: 'text-normal',
      subtitleClass: 'text-sm text-muted',
    },
  }}
  items={[
    {
      actions: [
        {
          label: 'SaaS landing',
          subtitle:
            'Hero, logos, features, pricing, testimonials, FAQ and a blog, with anchor navigation.',
          href: '/demos/preview/saas',
          target: '_blank',
          image: {
            src: '~/assets/images/demos/saas/content-a.jpg',
            alt: '',
            width: 480,
            height: 270,
            layout: 'cover',
          },
          imageSize: 'aspect-video w-full object-cover rounded',
        },
      ],
    },
  ]}
/>
-->

## The big picture

The site is one long landing page with anchor navigation (Product, Pricing, Customers, FAQ) plus a blog, in English and Spanish. Every section is a block from the library, sometimes two nested ones; there is no hand-written section markup. Its personality comes from three places: a handful of token overrides, one shared "dusk" gradient, and a few reusable prop objects.

### Things that are shared by the whole page

- **Theme by tokens.** `_theme.css` overrides semantic tokens on `[data-demo='saas']`: a near-black `primary`, a mauve `secondary`, a deep night `tertiary` and a peach `accent`, plus larger radii and the Libre Franklin font. The page passes `demo="saas"` to `Layout`, and every block picks the colours up. Read [Colors](/documentation/base/Colors) for the token names.
- **The dusk gradient.** `bg-tertiary → secondary → accent` sits behind the hero and the closing call to action; the header and footer use the solid `bg-tertiary` end of it. Text on it uses one class string, `ON_DUSK`, so it stays light in both themes.
- **Shared prop objects.** `_site.ts` exports `SECTION_HEADLINE` (light, tightly tracked titles over a grey second line), `POST_CARD` and the navigation items. Sections spread them into their `headline` prop, which is how a dozen sections end up with the same voice without a wrapper component.
- **Copy by language.** Every word lives in `src/copy/saas/en.yaml` and `es.yaml`, read with `useCopy(Astro, 'saas')`. The page maps the YAML into block props: steps into tabs, tiers into pricing, stats into items.
- **Invented content.** The company, the logos, the numbers, the quote and the prices are placeholders.

## The sections, from top to bottom

### 1. Header and menu

![The header, pulled apart into its layers](images/01-header.svg)

**What you see:** a sticky dark bar with the Driftwave wordmark, anchor links, a theme toggle and a small "Get started" button. On phones the links fold into a menu that slides in from the left.

**Built from:** [Header](/documentation/composite/Header) with `isSticky` and a `bg-tertiary` container background. The wordmark is an inline SVG passed as `logo.vector`, the links are a `leftNavigationTreeHorizontal`, and the button is one entry in `rightButtons`. A burger button in `leftButtons` carries `data-modal-trigger="saas-menu"`, which opens a [Modal](/documentation/layout/Modal) holding a [NavigationTree](/documentation/composite/NavigationTree) of the same items.

### 2. Hero

![The hero, pulled apart into its layers](images/02-hero.svg)

**What you see:** a big, light headline on the dusk gradient, one "Get started" button, and a product photo that overlaps the bottom edge of the gradient.

**Built from:** [Hero](/documentation/composite/Hero) with `container.background.class` set to the dusk gradient and a left-aligned `headline`. The extra bottom padding (`spacing.padding`) leaves room for the photo, which is an [Image](/documentation/primitives/Image) in a separate [Container](/documentation/layout/Container) pulled upwards with a negative top margin on `content.class`. Two plain blocks overlapping is all the "hero with screenshot" pattern needs.

### 3. Customer logos

![The logo strip, pulled apart into its layers](images/03-logos.svg)

**What you see:** a slowly scrolling row of grey customer logos.

**Built from:** [LogoCloud](/documentation/composite/LogoCloud) with `layout="marquee"` and `grayscale`. The marquee runs on a [ContentCarousel](/documentation/composite/ContentCarousel) whose arrows are switched off with `prevButton: false` and `nextButton: false`.

### 4. From event to answer

![The workflow tabs, pulled apart into their layers](images/04-workflow.svg)

**What you see:** five steps listed on the left; picking one highlights it, reveals its sentence and swaps the picture on the right.

**Built from:** a [Headline](/documentation/primitives/Headline) (with `anchorId="features"`, the target of the "Product" link) above vertical [Tabs](/documentation/composite/Tabs). `defaultItemConfig` makes every tab a ghost button with its subtitle hidden; `activeItemConfig` gives the selected one a surface background and shows the subtitle. Each panel is an Image passed into the `panel-0` … `panel-4` slots. It is a good example of a layer (`activeItemConfig`) changing one child by state.

### 5. One source of truth

![The teams table, pulled apart into its layers](images/05-teams.svg)

**What you see:** a white card floating on a soft mauve-to-peach wash, holding a headline and a small table.

**Built from:** a [Container](/documentation/layout/Container) whose `background.class` is the wash and whose `content.class` turns the content box into the rounded white card. Inside, a Headline and a nested Container render the table, which is plain Markdown in the copy file: Container items accept rich text, so a table needs no table block.

### 6. Stats

![The stats band, pulled apart into its layers](images/06-stats.svg)

**What you see:** three huge numbers with a short label under each, over a thin rule.

**Built from:** [ItemsContent](/documentation/composite/ItemsContent) with an `itemsGrid` of three columns. The look is all `defaultItemConfig`: a very large, light `titleClass` for the number and a muted `textClass` for the label.

### 7. Customer quote

![The quote, pulled apart into its layers](images/07-quote.svg)

**What you see:** one large quote in a rounded grey card, signed with a portrait, name and role.

**Built from:** [Testimonials](/documentation/composite/Testimonials) with a single testimonial and `columns={1}`. `defaultTestimonialConfig` sets the card (`bg-surface`, rounded, no border) and the oversized `quoteClass`.

### 8. Features

![The features grid, pulled apart into its layers](images/08-features.svg)

**What you see:** six features in a grid of hairline cells, like a table without a header.

**Built from:** ItemsContent again, this time with `gap: 'none'`. The grid draws the top and left border, each item draws its right and bottom border through `defaultItemConfig.class`, and together they form the cells. Same block as the stats; only the configuration differs.

### 9. Pricing

![The pricing section, pulled apart into its layers](images/09-pricing.svg)

**What you see:** a Monthly / Yearly switch and three plans, the middle one outlined as the recommended plan.

**Built from:** [Pricing](/documentation/composite/Pricing). Each tier carries both prices; the `toggleGroup` switches between them and `billingAnnouncement` tells screen readers which period is showing. The tier with `highlighted: true` gets `highlightedTierConfig` (surface background, primary border) on top of `defaultTierConfig` (rounded corners, pill buttons). The currency follows the language: USD in English, EUR in Spanish.

### 10. Customer stories

![The customer stories, pulled apart into their layers](images/10-stories.svg)

**What you see:** three wide photos, each above a big figure and a one-line result.

**Built from:** ItemsContent a third time, with `orientation: 'vertical'` items so the image sits on top, and a `mediaClass` that crops every image to the same wide ratio.

### 11. From the blog

![The blog teaser, pulled apart into its layers](images/11-blog.svg)

**What you see:** the three featured posts as cards and an "All posts" button.

**Built from:** a Headline, a [CollectionList](/documentation/composite/CollectionList) fed by `getFeatured('posts', 3, langCode)`, and a [Button](/documentation/primitives/Button). The cards use the shared `POST_CARD` config, the same one the blog index uses, so both pages show identical cards.

### 12. Questions

![The FAQ, pulled apart into its layers](images/12-faq.svg)

**What you see:** the "Questions" title on the left and expandable answers on the right.

**Built from:** a [TwoColumnContainer](/documentation/layout/TwoColumnContainer) with `ratio="2:3"`: a Headline in its `left` slot and an [Accordion](/documentation/primitives/Accordion) in its `right` slot. The answers are rich text, so the bold and italic in the copy file come through.

### 13. Privacy first

![The privacy band, pulled apart into its layers](images/13-privacy.svg)

**What you see:** a grey band with a short promise and four points, each with a shield icon.

**Built from:** ItemsContent with `container.class` set to `bg-surface` and a two-column grid of horizontal items, each with an `icon`. `defaultItemConfig.icon` colours every icon at once.

### 14. Closing call to action

![The closing call to action, pulled apart into its layers](images/14-cta.svg)

**What you see:** the dusk gradient again, with one centred line and the "Get started" button.

**Built from:** [CallToAction](/documentation/composite/CallToAction) with the same gradient on `container.background.class`. Its card is made invisible (`container.content.class` set to `bg-transparent shadow-none`) so the headline sits straight on the gradient; the button reuses the hero's `getStarted` props.

### 15. Footer

![The footer, pulled apart into its layers](images/15-footer.svg)

**What you see:** a dark band with the wordmark, the same links as the header, social icons, the language switch and the copyright line.

**Built from:** [Footer](/documentation/composite/Footer) with the `bg-tertiary` background. The header's navigation items become `secondaryButtons`, styled as links with `defaultSecondaryButtonConfig`; `socialButtons` and `defaultSocialButtonConfig` do the same for the icons; `languageToggle` adds the [LanguageToggle](/documentation/primitives/LanguageToggle).

### The blog pages

The blog index (`/demos/saas/blog`) is a Headline and a paginated CollectionList with the same `POST_CARD`; each post renders through [PostLayout](/documentation/composite/PostLayout). Both use the collection page helpers described in [Collections](/documentation/guides/Collections), and both sit inside the same layout, so header, footer and theme come for free.

## Blocks this site could add

### Contact form

![A contact form block, with its fields pulled forward](images/idea-contactform.svg)

The Scale plan says "Contact sales" but links back to pricing. A [ContactForm](/documentation/composite/ContactForm) on its own section would give that button somewhere to go.

### Timeline

![A timeline block, with one release pulled forward](images/idea-timeline.svg)

A product changelog or roadmap fits [ItemsTimeline](/documentation/composite/ItemsTimeline): dated entries on a line, styled through the same item layers used throughout this page.

## Where to read next

- [Composing blocks](/documentation/guides/Composing) explains instances, layers and merge order, which every section above leans on.
- [Collections](/documentation/guides/Collections) covers the blog setup.
- [Portfolio](/documentation/demos/Portfolio) shows the same blocks across a multi-page studio site.
- [Local business](/documentation/demos/Local) shows them in a bakery site with opening hours, a map and events.
- [Jewellery store](/documentation/demos/Jewellery) shows them in a store with tabbed collections and a 3D ring configurator.
