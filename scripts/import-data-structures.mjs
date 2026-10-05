import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { slug } from 'github-slugger'
import YAML from 'yaml'

import { excalidrawSvg } from './lib/excalidraw-svg.mjs'

const args = process.argv.slice(2)
const option = (name) => args[args.indexOf(name) + 1]
if (!args.includes('--vault') || !args.includes('--publish-date'))
  throw new Error(
    'Usage: node scripts/import-data-structures.mjs --vault /path/to/Study --publish-date YYYY-MM-DD'
  )
const publication = option('--publish-date')
if (
  !/^\d{4}-\d{2}-\d{2}$/.test(publication) ||
  new Date(`${publication}T00:00:00Z`).toISOString().slice(0, 10) !== publication
)
  throw new Error('Invalid publication date')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(option('--vault'), '4.Study/1. 考研/1. 408/1. 数据结构')
const destination = path.join(root, 'src/content/tutorials/data-structures')
const manifest = [
  [
    '0. 绪论/0.1 数据结构基本概念.md',
    '01-introduction/01-concepts',
    '绪论',
    0,
    1,
    '0.1 数据结构基本概念',
    '从逻辑结构、存储结构与运算，理解数据结构和 ADT 的关系。'
  ],
  [
    '0. 绪论/0.2 算法和算法评价.md',
    '01-introduction/02-algorithms',
    '绪论',
    0,
    2,
    '0.2 算法和算法评价',
    '算法的基本性质、时间复杂度与空间复杂度，结合代码逐步分析。'
  ],
  [
    '1. 线性表/1.1 线性表.md',
    '02-linear-lists/01-list',
    '线性表',
    1,
    1,
    '1.1 线性表',
    '线性表的逻辑结构、基本操作与边界条件。'
  ],
  [
    '1. 线性表/1.2 顺序表.md',
    '02-linear-lists/02-array-list',
    '线性表',
    1,
    2,
    '1.2 顺序表',
    '顺序表的存储、插入、删除与查找，附 C 语言实现。'
  ],
  [
    '1. 线性表/1.3 单链表.md',
    '02-linear-lists/03-linked-list',
    '线性表',
    1,
    3,
    '1.3 单链表',
    '从头结点、前驱与指针操作，理解单链表的实现和不变量。'
  ],
  [
    '1. 线性表/1.4 链表变体.md',
    '02-linear-lists/04-list-variants',
    '线性表',
    1,
    4,
    '1.4 链表变体',
    '双链表、循环链表与静态链表的结构和操作。'
  ],
  [
    '1. 线性表/1.5 顺序表与链表对比.md',
    '02-linear-lists/05-comparison',
    '线性表',
    1,
    5,
    '1.5 顺序表与链表对比',
    '结合内存布局、操作成本和工作负载，比较顺序表与链表。'
  ],
  [
    'BOX/知识卡片-DS/第1讲 绪论/101-ADT抽象数据类型.md',
    '03-cards/101-adt',
    '知识卡片',
    2,
    101,
    'ADT 抽象数据类型',
    '从一个问题出发，辨清线性表、顺序表、链表与 ADT。'
  ],
  [
    'BOX/知识卡片-DS/第2讲 复杂度分析/201-时间复杂度计算技巧.md',
    '03-cards/201-complexity',
    '知识卡片',
    2,
    201,
    '时间复杂度计算技巧',
    '时间复杂度分析中的常见问题与计算技巧。'
  ],
  [
    'BOX/知识卡片-DS/第4讲 线性表/401-单链表头节点的作用.md',
    '03-cards/401-head-node',
    '知识卡片',
    2,
    401,
    '单链表头节点的作用',
    '理解头节点怎样统一链表操作中的边界情况。'
  ],
  [
    'BOX/知识卡片-DS/第4讲 线性表/402-顺序表位序与数组下标.md',
    '03-cards/402-position-index',
    '知识卡片',
    2,
    402,
    '顺序表位序与数组下标',
    '区分逻辑位序与数组下标，避免差一错误。'
  ],
  [
    'BOX/知识卡片-DS/第4讲 线性表/403-链表四种结构与操作核心.md',
    '03-cards/403-list-structures',
    '知识卡片',
    2,
    403,
    '链表四种结构与操作核心',
    '对比不同链表结构中的链接关系与操作核心。'
  ]
]
const urls = new Map()
for (const [file, id] of manifest) {
  urls.set(file.replace(/\.md$/, ''), `/tutorials/data-structures/${id}`)
  urls.set(path.basename(file, '.md'), `/tutorials/data-structures/${id}`)
}
urls.set('00-数据结构', '/tutorials')
const diagrams = new Map([
  [
    'BOX/Excalidraw/数据结构三层关系.relationship.md',
    ['three-levels.svg', '数据结构的三个观察层次']
  ],
  [
    'BOX/Excalidraw/顺序表与链表内存布局.relationship.md',
    ['memory-layout.svg', '顺序表与链表的内存布局']
  ]
])
const assets = path.join(root, 'public/tutorial-assets/data-structures')
await fs.mkdir(assets, { recursive: true })
for (const [file, [name, title]] of diagrams) {
  await fs.writeFile(
    path.join(assets, name),
    excalidrawSvg(await fs.readFile(path.join(source, file), 'utf8'), title)
  )
}
const unresolved = new Map()
let linked = 0
let embedded = 0
const escapeHtml = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
for (const [file, id, chapter, chapterOrder, order, title, description] of manifest) {
  const original = await fs.readFile(path.join(source, file), 'utf8')
  const frontmatter = original.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  const metadata = frontmatter ? YAML.parse(frontmatter[1]) : {}
  const body = frontmatter ? original.slice(frontmatter[0].length) : original
  let fence = null
  let tabGroup = false
  let tabOpen = false
  const lines = body.split(/\r?\n/).map((line) => {
    if (fence) {
      if (new RegExp(`^\\s*(?:>\\s*)?${fence.character}{${fence.length},}\\s*$`).test(line))
        fence = null
      return line
    }
    if (/^~~~tabs\s*$/.test(line)) {
      tabGroup = true
      return '<div class="note-examples">\n'
    }
    if (tabGroup && /^~~~\s*$/.test(line)) {
      tabGroup = false
      const closing = tabOpen ? '\n</details>\n' : ''
      tabOpen = false
      return `${closing}</div>`
    }
    if (tabGroup && /^tab:/.test(line)) {
      const label = line.replace(/^tab:\s*/, '').replace(/^`|`$/g, '')
      const closing = tabOpen ? '\n</details>\n' : ''
      tabOpen = true
      return `${closing}<details class="note-example" open><summary>${escapeHtml(label)}</summary>\n`
    }
    const code = line.match(/^\s*(?:>\s*)?(`{3,}|~{3,})/)
    if (code) {
      fence = { character: code[1][0], length: code[1].length }
      return line
    }
    // The web page owns h1; all source heading text and section numbers remain intact.
    line = line.replace(/^((?:>\s*)*)(#{1,5}) /, '$1#$2 ')
    return line.replace(/(!?)\[\[([^\]]+)\]\]/g, (_, embed, reference) => {
      const [target, ...aliases] = reference.split('|')
      const [rawName, anchor] = target.split('#')
      const name = rawName.replace(/\.md$/, '')
      const label = aliases.join('|') || (anchor && !name ? anchor : path.basename(name))
      if (embed) {
        const diagram = diagrams.get(rawName)
        if (!diagram) throw new Error(`Unmapped embed ${target} in ${file}`)
        embedded++
        return `![${diagram[1]}](/tutorial-assets/data-structures/${diagram[0]})`
      }
      const relative = path.posix.normalize(path.posix.join(path.posix.dirname(file), name))
      const url = !name
        ? ''
        : (urls.get(relative) ?? urls.get(name) ?? urls.get(path.posix.basename(name)))
      if ((url !== undefined || !name) && !anchor?.startsWith('^')) {
        linked++
        return `[${label}](${url ?? ''}${anchor ? `#${slug(anchor)}` : ''})`
      }
      unresolved.set(target, (unresolved.get(target) ?? 0) + 1)
      return label
    })
  })
  if (fence || tabGroup || tabOpen) throw new Error(`Unclosed fenced block in ${file}`)
  const data = {
    title,
    description,
    publishDate: publication,
    ...(metadata.updated ? { sourceUpdated: String(metadata.updated).slice(0, 10) } : {}),
    course: 'data-structures',
    series: '数据结构',
    chapter,
    chapterOrder,
    order,
    tags: ['数据结构', chapter],
    draft: false
  }
  const output = path.join(destination, `${id}.md`)
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `---\n${YAML.stringify(data)}---\n${lines.join('\n').trim()}\n`)
}
await fs.mkdir(path.join(root, 'docs'), { recursive: true })
await fs.writeFile(
  path.join(root, 'docs/data-structures-import.md'),
  `# 数据结构首批展示笔记\n\n收录日期：${publication}。来源为用户的 Obsidian 数据结构目录；脚本只读取源文件。\n\n共 ${manifest.length} 篇：绪论 2 篇、线性表 5 篇、知识卡片 5 篇。\n\n- 保留正文、代码、公式、表格、问题与章节编号；源标题下移一级以避免重复 h1。\n- 提示块转换为网页提示块；Obsidian tabs 转成可折叠示例。\n- ${embedded} 个 Excalidraw 嵌入导出为 SVG，保留文字、位置、颜色和箭头；绘图线条采用平滑 SVG。\n- ${linked} 处双链转换为站内链接。没有收录的关联页面保留显示文字，不创建失效链接。\n- 源笔记更新时间保存在 sourceUpdated，网站收录日期为 publishDate。\n\n## 收录文件\n\n${manifest.map(([file, id]) => `- ${file} → /tutorials/data-structures/${id}`).join('\n')}\n\n## 尚未收录的关联页面\n\n${[...unresolved].map(([target, count]) => `- ${target}（${count} 处）`).join('\n')}\n`
)
console.log(
  JSON.stringify(
    {
      notes: manifest.length,
      diagrams: diagrams.size,
      embedded,
      linked,
      unresolved: [...unresolved.keys()]
    },
    null,
    2
  )
)
