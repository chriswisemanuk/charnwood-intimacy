import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.charnwoodintimacy.co.uk',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // Thank-you pages are noindex, so keep them out of the sitemap too
      filter: (page) => !page.includes('thank-you'),
    }),
  ],
  build: {
    format: 'directory',
  },
});
