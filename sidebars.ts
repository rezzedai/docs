import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/quick-start',
        'getting-started/installation',
        'getting-started/your-first-workflow',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/overview',
        'concepts/programs',
        'concepts/tasks',
        'concepts/messages',
        'concepts/sessions',
        'concepts/authentication',
        'concepts/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/claude-code',
        'guides/cursor',
        'guides/vscode-copilot',
        'guides/mobile-app',
        'guides/multi-agent',
        'guides/dream-sessions',
        'guides/self-hosting',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/cli',
        {
          type: 'category',
          label: 'MCP Tools',
          items: [
            'reference/mcp-tools/task-management',
            'reference/mcp-tools/messaging',
            'reference/mcp-tools/sessions',
            'reference/mcp-tools/sprints',
            'reference/mcp-tools/keys',
            'reference/mcp-tools/admin',
          ],
        },
        'reference/rest-api',
        'reference/message-types',
      ],
    },
    {
      type: 'category',
      label: 'Pricing',
      items: ['pricing/plans'],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/mcp-errors',
        'troubleshooting/faq',
      ],
    },
    {
      type: 'category',
      label: 'Legal',
      items: [
        'legal/privacy',
        'legal/terms',
      ],
    },
  ],
};

export default sidebars;
