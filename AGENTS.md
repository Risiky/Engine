# Project Tech Summary

## Primary Frameworks
- Front-end framework: Vue 3
  - Declared in `package.json` as `vue ^3.5.13`
  - Resolved in `pnpm-lock.yaml` as `3.5.31`
- Diagram engine: `@antv/x6`
  - Used to render and edit node-edge diagrams in the demo page
  - Declared in `package.json` as `^3.1.7`
  - Resolved in `pnpm-lock.yaml` as `3.1.7`
- Build tool: Vite
  - Declared in `package.json` as `vite ^7.1.9`
  - Resolved in `pnpm-lock.yaml` as `7.3.1`
- Module mode: native ES Modules
  - Enabled through `"type": "module"` in `package.json`

## Related Plugins
- `@vitejs/plugin-vue`
  - Used to let Vite compile Vue Single File Components (`.vue`)
  - Declared in `package.json` as `^6.0.1`
  - Resolved in `pnpm-lock.yaml` as `6.0.5`
- `unplugin-vue-components`
  - Used for auto-import and on-demand registration of Vue components in templates
  - Declared in `package.json` as `^32.0.0`
  - Resolved in `pnpm-lock.yaml` as `32.0.0`
- `ant-design-vue`
  - Used as the current UI component library for buttons and tags in the demo screen
  - Declared in `package.json` as `^4.2.6`
  - Resolved in `pnpm-lock.yaml` as `4.2.6`
- Vite config currently enables:
  - `plugins: [vue()]`
  - `unplugin-vue-components` with `AntDesignVueResolver`
  - manual chunk splitting for `@antv/x6`-related dependencies
  - local dev server host `127.0.0.1`
  - local dev server port `5173`

## Current Engineering Shape
- Package manager: `pnpm`
  - Inferred from the presence of `pnpm-lock.yaml`
- Entry mode: standard Vite app entry
  - HTML entry: `index.html`
  - App entry: `src/main.js`
- Component form: Vue Single File Component
  - Current root component: `src/App.vue`
  - X6 demo component is lazy-loaded from `src/components/X6GraphDemo.vue`
- Styling approach: native CSS
  - Global stylesheet: `src/styles.css`
  - No Sass/Less/Tailwind/PostCSS plugin configuration found in the current dependency list

## Not Currently Introduced
- TypeScript
- Vue Router
- Pinia
- Test framework configuration
- Linting or formatting tool dependencies

## Start Commands
- `pnpm dev`: start local development server
- `pnpm build`: create production build
- `pnpm preview`: preview build output locally

## Notes For Future Collaboration
- This repository is currently a lightweight Vue 3 + Vite front-end starter with Ant Design Vue and an X6 diagram demo.
- If new frameworks or plugins are added later, update this file first based on `package.json`, lockfile, and `vite.config.js`.
