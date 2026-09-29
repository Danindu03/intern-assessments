# How we write code in this project

These are the conventions we follow in our production apps. Please follow them
here too; we look at this closely when reviewing your work.

## Angular

- Standalone components only. No `NgModule`.
- Use `inject()` for dependencies, not constructor injection.
- Keep component state in signals (`signal`, `computed`). This app runs
  zoneless, so plain class properties will not always update the view.
- Use typed Reactive Forms (`FormBuilder.nonNullable.group`). No
  template-driven forms.
- Use the new control flow (`@if`, `@for`, `@switch`), not `*ngIf` or `*ngFor`.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- Lazy-load feature routes, as `app.routes.ts` already does.

## Naming

- camelCase for model properties, with no type prefixes. `vesselName`, not
  `strVesselName`.
- Files are kebab-case: `vessel-list.ts`, `vessel-form.html`.
- Component classes are PascalCase without a `Component` suffix: `VesselList`.

## UI

- Use the shared components instead of raw HTML. `app-form-field`,
  `app-form-select`, `app-data-table`, `app-confirm-dialog`, `app-page-header`
  and `app-empty-state` cover almost everything you need.
- All colours, spacing and font sizes come from `src/styles/_tokens.scss`.
  Do not hard-code a hex colour or a pixel value in a component. If something
  is missing, add a token rather than a one-off value.
- Handle every state: loading, empty, no search results, error and validation.
- Long values should not break the layout. The table truncates with an
  ellipsis and shows the full value in a tooltip.
- Ask before adding a library. Bootstrap and Remix Icons are all we use here.

## Accessibility

- Every input has a label, through `app-form-field`.
- Icon-only buttons need an `aria-label`.
- Everything must work with the keyboard, and the focus outline stays visible.

## Git

- Small commits with clear messages, as you go.
- Do not commit `node_modules` or `dist`.
