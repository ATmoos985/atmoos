import type { Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  title: 'Atmoos',
  author: 'Ami',
  description: 'Ami 的公开技术笔记：组合优化、生产排程与求解器工程。',
  favicon: '/favicon/favicon-32x32.png',
  socialCard: '/favicon/android-chrome-512x512.png',
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
      { title: '首页', link: '/' },
      { title: '笔记', link: '/docs' },
      { title: '专题', link: '/topics' },
      { title: '项目', link: '/projects' },
      { title: '近况', link: '/now' },
      { title: 'CV', link: '/cv' },
      { title: '关于', link: '/about' }
    ]
  },

  footer: {
    year: `© ${new Date().getFullYear()} `,
    links: [],
    credits: false,
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/ATmoos985' },
      { icon: 'rss', label: '笔记 RSS', href: '/docs/rss.xml' }
    ]
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
    logbook: [],
    applyTip: [],
    cacheAvatar: false
  },
  pagefind: true,
  quote: {
    server: '',
    target: '() => ""'
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
    enable: false,
    server: '',
    showMeta: false,
    emoji: [],
    additionalConfigs: {
      pageview: false,
      comment: false,
      imageUploader: false
    }
  }
}

const config = { ...theme, integ } as Config
export default config
