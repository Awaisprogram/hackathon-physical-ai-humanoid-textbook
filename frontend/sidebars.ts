import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Physical AI & Humanoid Robotics',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'chapter-1/index',
          label: 'Chapter 1: Introduction',
        },
        {
          type: 'doc',
          id: 'chapter-2/index',
          label: 'Chapter 2: Physical AI Modules',
        },
        {
          type: 'doc',
          id: 'chapter-3/index',
          label: 'Chapter 3: Why Physical AI Matters',
        },
        {
          type: 'doc',
          id: 'chapter-4/index',
          label: 'Chapter 4: Hardware Requirements',
        },
      ],
    },
  ],
};

export default sidebars;