import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CacheBash Docs',
  tagline: 'MCP agent coordination for AI workflows',
  favicon: 'img/favicon.ico',
  future: { v4: true },
  url: 'https://docs.rezzed.ai',
  baseUrl: '/',
  organizationName: 'rezzedai',
  projectName: 'docs',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/rezzedai/docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/',
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'CacheBash',
      items: [
        { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
        { href: 'https://github.com/rezzedai/cachebash', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Getting Started', to: '/getting-started/quick-start' },
            { label: 'Concepts', to: '/concepts/overview' },
            { label: 'Guides', to: '/guides/claude-code' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'CLI', to: '/reference/cli' },
            { label: 'MCP Tools', to: '/reference/mcp-tools/task-management' },
            { label: 'REST API', to: '/reference/rest-api' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/rezzedai/cachebash' },
            { label: 'rezzed.ai', href: 'https://rezzed.ai' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Rezzed AI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
