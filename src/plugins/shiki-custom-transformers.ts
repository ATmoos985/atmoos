import { h } from 'hastscript'
import type { ShikiTransformer } from 'shiki'

function parseMetaString(str = '') {
  return Object.fromEntries(
    Array.from(str.matchAll(/([\w-]+)=(?:"([^"]*)"|'([^']*)')/g), (match) => [
      match[1],
      match[2] ?? match[3]
    ])
  )
}

// Nest a div in the outer layer
export const updateStyle = (): ShikiTransformer => {
  return {
    name: 'shiki-transformer-update-style',
    pre(node) {
      const container = h('pre', node.children)
      node.children = [container]
      node.tagName = 'div'
    }
  }
}

// Process meta string, like ```ts title="test.ts"
export const processMeta = (): ShikiTransformer => {
  return {
    name: 'shiki-transformer-process-meta',
    preprocess() {
      if (!this.options.meta) return
      const rawMeta = this.options.meta?.__raw
      if (!rawMeta) return
      const meta = parseMetaString(rawMeta)
      Object.assign(this.options.meta, meta)
    }
  }
}

// Add a title to the code block
export const addTitle = (): ShikiTransformer => {
  return {
    name: 'shiki-transformer-add-title',
    pre(node) {
      const rawMeta = this.options.meta?.__raw
      if (!rawMeta) return
      const meta = parseMetaString(rawMeta)
      // If meta is needed to parse in other transformers
      // if (this.options.meta) {
      //   Object.assign(this.options.meta, meta)
      // }
      if (!meta.title) return

      const div = h(
        'div',
        {
          class: 'title text-sm text-muted-foreground px-3 py-1 rounded-lg border'
        },
        meta.title.toString()
      )
      node.children.unshift(div)
    }
  }
}

// Add a language tag to the code block
export const addLanguage = (): ShikiTransformer => {
  return {
    name: 'shiki-transformer-add-language',
    pre(node) {
      const span = h(
        'span',
        { class: 'language ps-1 pe-3 text-sm bg-muted text-muted-foreground' },
        this.options.lang
      )
      node.children.push(span)
    }
  }
}

// Add a copy button to the code block
export const addCopyButton = (): ShikiTransformer => {
  return {
    name: 'shiki-transformer-copy-button',
    pre(node) {
      const button = h(
        'button',
        {
          type: 'button',
          class: 'copy',
          hidden: true,
          'aria-label': '复制代码',
          'data-code': this.source
        },
        '复制'
      )
      node.children.push(button)
    }
  }
}

// Long blocks collapse only after the reader script is ready.
export const addCollapse = (displayLineCount?: number): ShikiTransformer => {
  const line = displayLineCount || 15
  return {
    name: 'shiki-transformer-add-collapse',
    pre(node) {
      if (this.lines.length <= line) return
      const collapse = h(
        'button',
        {
          type: 'button',
          class: 'collapse-toggle',
          hidden: true,
          'aria-expanded': 'false'
        },
        '展开全部代码'
      )
      node.children.push(collapse)
    }
  }
}
