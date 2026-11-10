# Block composition contract

How a block exposes its children, layers their defaults, names its props and keeps its hooks. Every new block and every change to a block's props follows these rules. If a design needs to bend one, change this file in the same commit and record why.

The history of how each rule was reached (findings, reviews, amendments A1–A19) lives in `thoughts/shared/tasks/EPIC-Block-Composition-Standardization/`. This file is the current state; where the two disagree, this file wins.

`tests/unit/compositionContract.test.ts` and `tests/unit/classHooks.test.ts` check the mechanical rules (naming, layer types, `Partial`, `show*`, spacing words, imports, hooks, `!important`). The rest is for design and review.

## Vocabulary

- **Instance field**: holds the props of one rendered child (`container`) or a list of them (`leftButtons`). It has no suffix.
- **Layer**: a partial config merged into many children, or into one state of them. It is never rendered alone, and its name ends in `Config` (`defaultItemConfig`, `activeItemConfig`).
- **Internal default**: the parent's own baseline, declared in the `.astro` file and merged first.
- **Skeleton wrapper**: markup that defines a block's structure or script mechanics. It is fixed.
- **Child wrapper**: markup that only spaces or aligns one child, list or slot. It is configurable.
- **Hook**: anything a stylesheet or script selects on. Hooks are `data-*` attributes.

---

## 1. Naming a field that holds one child

**Rule.** Name the field after the child block in camelCase, with no suffix.

- When the parent holds the same block more than once, or the child is a generic Button, use `<role><Block>`, role first: `prevButton`, `leftNavigationTreeHorizontal`.
- Exception: a Button whose role is plain "action" is `action` (one) or `actions` (list).

**Why.** The name derives from the child's type with no judgement call, and the missing suffix marks it as an instance.

| Avoid                       | Use                                             |
| --------------------------- | ----------------------------------------------- |
| `languageToggleConfig`      | `languageToggle`                                |
| `closeButtonConfig`         | `closeButton`                                   |
| `viewer`, `layout`, `title` | `modelViewer`, `twoColumnContainer`, `headline` |

## 2. Lists and layers for repeated children

**Rule.**

- **List field:** `<role><Block>s` (`leftButtons`, `socialButtons`), or a plain role list (`items`, `options`, `tiers`).
- **Shared default:** `default<Noun>Config`.
  - `<Noun>` is the singular of the list field when each entry _is_ the child's props (`items` → `defaultItemConfig`).
  - When the parent splits an entry across elements, or there is no single list field, `<Noun>` is the block the layer reaches (`defaultButtonConfig`, `defaultImageConfig`, `defaultNavigationTreeHorizontalConfig`).
- **State layer:** `<state><Noun>Config`. State words are `active`, `inactive`, `selected`, `disabled` and `highlighted`. Never `defaultActive…`.
  - `selected` is a user choice; `highlighted` is an author-chosen emphasis (Pricing `highlightedTierConfig`).
- **"Default" applies to every state.** State layers sit on top of it.
- **Suffix check:** every `…Config` starts with `default` or a state word, and no instance field ends in `Config`.

```ts
leftButtons?: ButtonProps[];
rightButtons?: ButtonProps[];
defaultButtonConfig?: LayerConfig<ButtonProps>;
```

## 3. Merge order

**Rule.** Children are built with `mergeConfigs` (`src/utils/mergeConfigs.ts`) in this order, most specific last:

```
{} → internal base → internal state → default…Config → <state>…Config → structural → instance
```

- **The instance always wins**, and a field set on an instance applies in every state. To style only one state, use the `<state>…Config` layer (for example `tabs.activeItemConfig`), never the instance. Say so in the instance field's JSDoc.
- **Structural layer:** a value the parent derives from an item's structure (for example a chevron because the item has children) sits after the state layers so no layer can replace it. A dedicated parent prop configures it (`iconName`), and the instance still beats it.
- **No folding:** a parent never folds its own shared default into a child's instance layer. A default meant for a grandchild goes into the child's own `default…Config`.

```ts
mergeConfigs(
  {},
  internal,
  defaultItemConfig,
  hasChildren ? { icon: { name: iconName } } : {},
  item
);
```

### Writes after the spread

Only these may be written after `{...merged}`:

1. `data-*` hooks;
2. values derived from position (`data-index`, connector flags);
3. values the parent derives itself, each `Omit`ted from the child's type in that context;
4. a composition that contains the spread's own value, consumer part last (`cn(lastItemClass, item.class)`).

Everything else, including fallback defaults such as `ariaLabel` or `alt: ''`, goes in the internal layer. A field the parent's script must suppress is cleared on the merged config and documented on the prop that triggers it.

**Why.** Nothing the type advertises is silently overridden.

## 4. Field or inheritance

**Rule.** A block may extend its child's props (`extends Omit<ButtonProps, …>`) only when all three hold:

1. it renders exactly one child, as its root;
2. it `Omit`s every inherited field it controls, and never gives an inherited field a new meaning (omit first, then redeclare with its own JSDoc);
3. it applies defaults with `mergeConfigs`, not destructuring defaults.

Otherwise it uses an instance field (rule 1).

```ts
// ThemeToggle: defaults merged, so a consumer `icon` doesn't drop the others
mergeConfigs<ThemeToggleProps>(
  {},
  { size: 'md', variant: 'solid', intent: 'primary', icon: { name: 'heroicons:sun' } },
  Astro.props
);
```

## 5. Render conditions and flat props

**Rule.**

- **Render on presence.** An optional child renders when its field is present. There are no `show*` flags.
- A child that renders by default is typed `XProps | false`; `false` hides it (`closeButton?: ButtonProps | false`).
- Exception: `show*` stays only for generated parts that have no instance field (ContentCarousel `showIndicators`, TextArea `showCounter`, Map `showMarker`) and for position-derived flags (Item `showConnector*`). The list lives in `SHOW_FLAGS` in `tests/unit/compositionContract.test.ts`; a new flag goes there and here.
- A flag that picks a format rather than presence is a named enum, not `show*` (LanguageToggle `labelFormat: 'label' | 'code'`).
- **Child props live in the child's field.** `twoColumnContainer.reverseOnMobile`, not `reverseOnMobile` on the parent.
- **Child-wrapper props are flat on the parent**, named `<role>Class`, `<role>Align` or `<role>Gap`, where `<role>` is the field or text prop the wrapper holds (`actionsClass`, `buttonsGap`).
- **The parent's own structural choices stay flat** (`imagePosition: 'left' | 'right'`).

## 6. Spacing and layout vocabulary

| Word          | Meaning                                                                 | Where                                                                                                  |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `air`         | padding inside a box                                                    | Container only, as `content.air`                                                                       |
| `gap`         | space between children, enum `'none' \| 'tight' \| 'normal' \| 'loose'` | any block that lays out children                                                                       |
| `spacing.gap` | raw-class escape hatch                                                  | typed only where the receiving element is flex or grid; `Omit<SpacingConfig, 'gap'>` elsewhere         |
| `layout`      | how a block arranges its children                                       | Container `{ type, class }`, Tabs `tabList.layout`. Image and Vector keep Astro's image-sizing meaning |
| `orientation` | direction children flow, `'horizontal' \| 'vertical'`                   | ToggleGroup, Item, Button, Tabs                                                                        |
| `direction`   | reserved for text direction (ltr/rtl)                                   | —                                                                                                      |

## 7. Instance types and required-ness

**Rule.**

- **Instance fields** use the child's own `XProps`, never `Partial<>`. When the parent supplies some fields itself, it `Omit`s exactly those (`items: Omit<ButtonProps, 'id'>[]`).
- **Layers** use `LayerConfig<…>` (rule 11).
- An instance field is **required only** when the parent can render nothing meaningful without it.
- Don't widen a type with fields the block ignores. Every advertised field must have an effect.

**Why.** Child props are already all-optional where it matters, so `Partial` was a no-op or a false affordance, and it breaks the API reference links.

## 8. Classes and hooks

**Rule.**

- Class merging is add-only (tailwind-merge).
- Internal defaults may only use utilities a consumer can cancel with a same-group counter-utility (`shadow-none`, `p-0`, `rounded-none`).
- Defaults never use `!important`.
- **Every class a stylesheet or a script selects is a hook, and must be `data-*`.** Dead hooks are deleted.
- Script and CSS state lives in `data-*` attributes or the `hidden` attribute, never in a Tailwind utility inside a class string a consumer can merge into.
- State that consumer classes must not affect goes on a skeleton wrapper the consumer class can't reach.

Named exceptions that stay classes:

| Class                                     | Why                                   |
| ----------------------------------------- | ------------------------------------- |
| `carousel-item`                           | slot contract                         |
| `nav-tree-icon`, `nav-tree-icon-expanded` | Icon doesn't forward `data-*`         |
| `floating-player`                         | state that must beat consumer classes |
| `color-btn`                               | page markup, not a block              |

`tests/unit/classHooks.test.ts` enforces this list. Adding an exception means adding it here and there.

**Note.** Tailwind preflight sets `[hidden]{display:none !important}`, so hover can't reveal an attribute-hidden element. For hover/open states, use a `data-open`-style attribute on a skeleton wrapper styled in `global.css`.

## 9. Composite wrappers and headings

**Rule.**

- Child wrappers are configurable through `<role>Class` (rule 5).
- Skeleton wrappers are fixed. To change the skeleton, use a different block or its typed props.
- A composite renders titles through Headline, never a raw `<h2>`.
- Headline's `htmlTag` defaults to `'h2'`. Pages pass `'h1'` explicitly. Composites pass `htmlTag` through their `headline` field.
- Exception: Hero's internal headline default is `{ htmlTag: 'h1' }`, because a hero opens the page. A Hero rendered below the page's first heading passes `headline.htmlTag` explicitly.

## 10. Configs rendered more than once

**Rule.** Per-instance fields are `id`, `name`, `anchorId`, and any field the parent derives itself.

- **Decorative copy:** when one copy is decorative (`aria-hidden`), the parent strips those fields from it.
- **Parent-owned field:** when every copy is real and the parent assigns the field, the field type `Omit`s it (Tabs `items: Omit<ButtonProps, 'id'>[]`).
- Prefer a single render where the skeleton allows it.

**Why.** No duplicate DOM ids, and no consumer `id` silently overwritten.

## 11. Layer types

**Rule.** Every layer is typed `LayerConfig<…>`, from `src/types/config.types.ts`:

```ts
type PerInstanceKey = 'id' | 'name' | 'anchorId';
export type LayerConfig<T> = T extends unknown ? Partial<Omit<T, PerInstanceKey>> : never;
```

- It distributes over unions, so a discriminated child keeps its discriminant in the layer too.
- Parent-derived fields are additionally `Omit`ted per block.
- **Instance and layer never share an alias.** A shared alias names the instance shape; the layer wraps it in `LayerConfig<…>` at the field, and layer-only omissions are spelled out there:

  ```ts
  type ConfiguratorTextArea = Omit<TextAreaAttributes, 'group' | 'label' | 'hideLabel' | 'value'>;
  textArea?: ConfiguratorTextArea;
  defaultTextAreaConfig?: LayerConfig<Omit<ConfiguratorTextArea, 'error'>>;
  ```

- **Parent sets the child's discriminant:** when a parent's internal layer sets a child's discriminant, the parent's alias redefines the union so that member is the default, with the discriminant optional. The other members keep a required discriminant.

  ```ts
  type ConfiguratorToggleAppearance =
    { appearance: 'radio' } | { appearance?: 'cell'; variant?: 'solid' | 'outline' | 'ghost' };
  ```

  Known limit: a layer type can't see sibling layers, so a radio set in one layer plus a cell-only field in another compiles and the field is ignored.

- The docs generator's `stripWrapper` unwraps `LayerConfig<…>`, `Partial<…>` and `X | false`, so API reference links survive. A new alias that should link to the child's docs goes in `TYPE_LINK_ALIASES`.

## 12. Internal sub-components

**Rule.** A component split out of one parent:

- declares `Props` inline in its `.astro` file, never in `src/types/`;
- opens its frontmatter with `// Internal to <Parent>: <why it's split out>`;
- has no docs page or nav entry;
- is imported only by its parent.

## 13. Types files

- Every file under `src/types/`, `.d.ts` included, imports only through relative `./x.types`. Never `~/utils`, never the `~` alias.
- Public props are expressed in our own types, never a third-party library's: `VideoProps.source` is our `VideoSource`, not a player's source type. Swapping the library then doesn't change what consumers pass in. Astro's own types (`HTMLAttributes`, `ImageMetadata`) are allowed. When the type alone can't reject bad input, validate it at render time with a `validate*` helper in `src/utils/`.
- Any styled box reuses `CellProps` and extends it for extra fields. If the box is flex or grid, it re-adds `gap` under rule 6:

  ```ts
  tabList: Omit<CellProps, 'spacing'> & { spacing?: SpacingConfig; layout?; columns?; wrapperClass? }
  ```

---

## Cross-block decisions

Decisions that apply to a family of blocks, not a single prop.

### Intent and focus

- Panel intent covers the selected state and focus ring of every panel kind, `neutral` included.
- Neutral uses the `--color-emphasis` family. `--color-border-emphasis` is decorative and never shows state.
- Every focus ring colour comes from `focusRingClass(intent)` in `src/utils/intentStyles.ts`, Button included. Button's link variant keeps its `currentColor` base ring.
- Tabs aren't panels: style the active tab through `tabs.activeItemConfig`.

### Header layout

- The Logo renders once, as the middle child of `[data-header-row]` (`flex flex-wrap items-center`). Header `class` merges into that row.
- Both zones are `flex-1 basis-0`; the right zone is `justify-end`.
- The logo is centred while both zones fit, otherwise pushed toward the narrower side. A zone never runs under the logo.
- Labels never wrap and controls never shrink below their content. When the zones don't fit, a zone moves to its own line; a zone wider than the row wraps its own controls.
- A floating header grows taller; offsetting page content is the consumer's job.

### Configurator categories

A category holds identity (`name`, `heading`, `camera`, `triggerButton`), content (`options`, `value`, `fieldLabel`) and selection semantics (`mode`, `min`, `max`). Appearance goes in `toggleGroup` / `itemsGrid` / `textArea`, so the three `default…Config` layers stay symmetric.

---

## Checklist for a new block or prop

- [ ] Child fields named per rule 1; lists and layers per rule 2.
- [ ] Children built with `mergeConfigs` in rule 3's order; nothing after the spread except the four allowed kinds.
- [ ] Optional children render on presence; default-on children typed `XProps | false`.
- [ ] Instance fields use `XProps` / `Omit<XProps, …>`, never `Partial<>`; layers use `LayerConfig<…>`.
- [ ] No field the block ignores.
- [ ] Spacing words per rule 6.
- [ ] Hooks are `data-*`; no `!important` in defaults.
- [ ] `compositionContract.test.ts` and `classHooks.test.ts` pass.
- [ ] Titles through Headline with the right `htmlTag`.
- [ ] Types file imports only relative `./x.types`; no third-party library types in public props.
