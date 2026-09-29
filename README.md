# Intern Assessments

A small Angular workspace used for our intern assessments. It has a mock login,
a collapsible sidebar layout, shared UI components and a complete customer
register that works as the reference for the task.

There is no backend. The data lives in memory, in the services under
`src/app/core/services`, and resets when you refresh the page.

## Requirements

- Node 20 or later
- npm 10 or later

## Running it

```
npm install
npm start
```

Then open http://localhost:4200.

Sign in with one of the demo accounts:

| Username | Password   |
| -------- | ---------- |
| agent    | demo1234   |
| admin    | demo1234   |

## What's in here

```
src/app/
  core/
    data/        seed customers, vessels and countries
    guards/      auth guard
    models/      Customer, Vessel and shared types
    services/    auth, toast, customer and vessel services (mock API)
  layout/
    shell/       collapsible sidebar, top bar and routed content
  shared/
    form-field/      label, control, hint and validation message
    form-select/     select that works with Reactive Forms
    data-table/      table with paging and loading, empty and error states
    confirm-dialog/  modal shown before anything destructive
    page-header/     page title, subtitle and primary action
    empty-state/     used when a panel has nothing to show
    toast/           success and error messages
  features/
    auth/        login screen
    dashboard/   small landing page
    customers/   reference module: list and create/edit form
    vessels/     the screen the candidate builds
src/styles/_tokens.scss   colours, spacing, fonts and layout sizes
```

## The task

Build the vessel register in `src/app/features/vessels`, following the customer
register in `src/app/features/customers`. `VesselService` is already written and
has the same methods as `CustomerService`, so you should not need to change it.

See CONTRIBUTING.md for the conventions we expect you to follow.

## Scripts

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm start`     | Runs the dev server on port 4200 |
| `npm run build` | Builds to `dist/`                |
