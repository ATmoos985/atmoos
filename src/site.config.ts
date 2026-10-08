import type { Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  title: 'Atmoos',
  author: 'TSA',
  description: 'TSA 的个人简历、博客与教程，记录学习、实践和个人思考。',
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
      { title: 'CV', link: '/' },
      { title: '博客', link: '/blog' },
      { title: '教程', link: '/tutorials' }
    ]
  },

  footer: {
    year: `© ${new Date().getFullYear()} `,
    links: [],
    credits: false,
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/ATmoos985' },
      { icon: 'rss', label: '博客 RSS', href: '/blog/rss.xml' }
    ]
  },

  content: {
    externalLinks: {
      content: ' ->',
      properties: { style: 'user-select:none' }
    },
    blogPageSize: 8,
    share: []
  }
}

export const integ: IntegrationUserConfig = {
  links: {
    logbook: [],
    applyTip: [],
    cacheAvatar: false
  },
  pagefind: false,
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
