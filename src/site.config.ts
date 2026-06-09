import type { CardListData, Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  title: 'Atmoos',
  author: 'Ami',
  description: '杂想、笔记与长期整理的知识库',
  favicon: '/favicon/favicon.ico',
  socialCard: '/images/social-card.png',
  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'zh-CN',
    dateOptions: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  logo: {
    src: '/src/assets/avatar-atmoos.png',
    alt: 'Atmoos 文字头像'
  },

  titleDelimiter: '-',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',
  head: [],
  customCss: [],

  header: {
    menu: [
      { title: '杂想', link: '/blog' },
      { title: '笔记库', link: '/docs' },
      { title: '项目', link: '/projects' },
      { title: '友链', link: '/links' },
      { title: '关于', link: '/about' }
    ]
  },

  footer: {
    year: `© ${new Date().getFullYear()} Ami`,
    links: [
      {
        title: '站点说明',
        link: '/terms',
        pos: 2
      }
    ],
    credits: false,
    social: [{ icon: 'rss', label: 'RSS', href: '/rss.xml' }]
  },

  content: {
    externalLinks: {
      content: ' ->',
      properties: { style: 'user-select:none' }
    },
    blogPageSize: 8,
    share: ['weibo', 'x', 'bluesky']
  }
}

export const integ: IntegrationUserConfig = {
  links: {
    logbook: [
      { date: '2026-06-09', content: '把这里改成自己的记录入口。' },
      { date: '2026-06-09', content: '杂想保留时间流，笔记库保留结构。' }
    ],
    applyTip: [
      { name: '名称', val: theme.title },
      { name: '描述', val: theme.description || '个人记录站' },
      { name: '链接', val: 'https://atmoos.vercel.app/' },
      { name: '头像', val: 'https://atmoos.vercel.app/favicon/favicon.ico' }
    ],
    cacheAvatar: false
  },
  pagefind: true,
  quote: {
    server: 'https://dummyjson.com/quotes/random',
    target: `(data) => (data.quote.length > 80 ? \`\${data.quote.slice(0, 80)}...\` : data.quote || 'Error')`
  },
  typography: {
    class: 'prose text-base',
    blockquoteStyle: 'italic',
    inlineCodeBlockStyle: 'modern'
  },
  mediumZoom: {
    enable: true,
    selector: '.prose .zoomable',
    options: {
      className: 'zoomable'
    }
  },
  waline: {
    enable: true,
    server: 'https://astro-theme-pure-waline.arthals.ink/',
    showMeta: false,
    emoji: ['bmoji', 'weibo'],
    additionalConfigs: {
      pageview: true,
      comment: true,
      locale: {
        reaction0: '喜欢',
        placeholder: '欢迎留下想法。'
      },
      imageUploader: false
    }
  }
}

export const terms: CardListData = {
  title: '站点说明',
  list: [
    {
      title: '隐私政策',
      link: '/terms/privacy-policy'
    },
    {
      title: '使用条款',
      link: '/terms/terms-and-conditions'
    },
    {
      title: '版权声明',
      link: '/terms/copyright'
    },
    {
      title: '免责声明',
      link: '/terms/disclaimer'
    }
  ]
}

const config = { ...theme, integ } as Config
export default config
