#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const UPDATED_DATE = '2026-07-31'
const EXPECTED_SOURCE_FILE_COUNT = 50
const EXPECTED_TUTORIAL_WIKILINK_COUNT = 218
const EXPECTED_OUTPUT_FILE_COUNT = 49

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const outputRoot = path.resolve(scriptDirectory, '../src/content/docs/timefold')
const sourceArgument = process.argv[2]

if (!sourceArgument || sourceArgument === '--help' || sourceArgument === '-h') {
  console.error('Usage: node scripts/import-timefold.mjs <path-to-TimeFold-notes>')
  process.exit(sourceArgument ? 0 : 1)
}

const sourceRoot = path.resolve(sourceArgument)

const sections = {
  overview: { order: 0 },
  gettingStarted: { id: '01-getting-started', order: 1 },
  domainModeling: { id: '02-domain-modeling', order: 2 },
  constraints: { id: '03-constraints', order: 3 },
  algorithms: { id: '04-algorithms', order: 4 },
  benchmarking: { id: '05-benchmarking', order: 5 },
  tuning: { id: '06-tuning', order: 6 }
}

// Explicit mappings keep every public URL stable even if a Chinese note title changes.
const entries = [
  {
    source: 'TimeFold学习索引.md',
    output: '00-overview.md',
    section: 'overview',
    order: 0,
    isIndex: true,
    transform: 'publicOverview'
  },
  {
    source: '0. 如何配置TimeFold/00-TimeFold配置索引.md',
    output: '01-getting-started/00-index.md',
    section: 'gettingStarted',
    order: 0,
    isIndex: true
  },
  {
    source: '0. 如何配置TimeFold/01-TimeFold是什么与适用场景.md',
    output: '01-getting-started/01-introduction.md',
    section: 'gettingStarted',
    order: 1
  },
  {
    source: '0. 如何配置TimeFold/02-快速开始与项目依赖.md',
    output: '01-getting-started/02-quick-start.md',
    section: 'gettingStarted',
    order: 2
  },
  {
    source: '0. 如何配置TimeFold/03-Solver配置XML与代码配置.md',
    output: '01-getting-started/03-solver-configuration.md',
    section: 'gettingStarted',
    order: 3
  },
  {
    source: '0. 如何配置TimeFold/04-运行Solver与SolverManager.md',
    output: '01-getting-started/04-running-solver.md',
    section: 'gettingStarted',
    order: 4
  },
  {
    source: '0. 如何配置TimeFold/05-SpringBoot-Quarkus与持久化集成.md',
    output: '01-getting-started/05-framework-integration.md',
    section: 'gettingStarted',
    order: 5
  },
  {
    source: '0. 如何配置TimeFold/06-版本路线与升级注意.md',
    output: '01-getting-started/06-version-upgrades.md',
    section: 'gettingStarted',
    order: 6,
    transform: 'publicVersionGuide'
  },
  {
    source: '0. 如何配置TimeFold/07-1.x到2.x破坏性变更详解.md',
    output: '01-getting-started/07-migration-1-to-2.md',
    section: 'gettingStarted',
    order: 7
  },
  {
    source: '1. 领域模型建模/00-领域模型建模索引.md',
    output: '02-domain-modeling/00-index.md',
    section: 'domainModeling',
    order: 0,
    isIndex: true
  },
  {
    source: '1. 领域模型建模/01-规划问题建模总览.md',
    output: '02-domain-modeling/01-modeling-overview.md',
    section: 'domainModeling',
    order: 1
  },
  {
    source: '1. 领域模型建模/02-ProblemFact-PlanningEntity-PlanningSolution.md',
    output: '02-domain-modeling/02-domain-objects.md',
    section: 'domainModeling',
    order: 2
  },
  {
    source: '1. 领域模型建模/03-PlanningVariable与ValueRange.md',
    output: '02-domain-modeling/03-planning-variables.md',
    section: 'domainModeling',
    order: 3
  },
  {
    source: '1. 领域模型建模/04-影子变量与链式建模.md',
    output: '02-domain-modeling/04-shadow-variables.md',
    section: 'domainModeling',
    order: 4,
    transform: 'generalizeSchedulingExample'
  },
  {
    source: '1. 领域模型建模/05-时间建模模式.md',
    output: '02-domain-modeling/05-time-modeling.md',
    section: 'domainModeling',
    order: 5
  },
  {
    source: '1. 领域模型建模/06-动态问题-插单与连续规划.md',
    output: '02-domain-modeling/06-continuous-planning.md',
    section: 'domainModeling',
    order: 6
  },
  {
    source: '1. 领域模型建模/07-PlanningListVariable与列表变量影子体系.md',
    output: '02-domain-modeling/07-list-variables.md',
    section: 'domainModeling',
    order: 7
  },
  {
    source: '1. 领域模型建模/08-PlanningClone与SolutionManager-ScoreManager.md',
    output: '02-domain-modeling/08-solution-management.md',
    section: 'domainModeling',
    order: 8
  },
  {
    source: '2. 约束编程/00-约束编程索引.md',
    output: '03-constraints/00-index.md',
    section: 'constraints',
    order: 0,
    isIndex: true
  },
  {
    source: '2. 约束编程/01-Score体系-硬约束软约束与权重.md',
    output: '03-constraints/01-score.md',
    section: 'constraints',
    order: 1
  },
  {
    source: '2. 约束编程/02-ConstraintStreams总览.md',
    output: '03-constraints/02-constraint-streams.md',
    section: 'constraints',
    order: 2
  },
  {
    source: '2. 约束编程/03-常用构件-forEach-filter-join-groupBy.md',
    output: '03-constraints/03-stream-building-blocks.md',
    section: 'constraints',
    order: 3
  },
  {
    source: '2. 约束编程/04-约束权重运行时调整.md',
    output: '03-constraints/04-constraint-weights.md',
    section: 'constraints',
    order: 4
  },
  {
    source: '2. 约束编程/05-公平性与负载均衡约束.md',
    output: '03-constraints/05-fairness.md',
    section: 'constraints',
    order: 5
  },
  {
    source: '2. 约束编程/06-Score解释-Analysis-Diff-HeatMap.md',
    output: '03-constraints/06-score-analysis.md',
    section: 'constraints',
    order: 6
  },
  {
    source: '2. 约束编程/07-约束性能优化.md',
    output: '03-constraints/07-performance.md',
    section: 'constraints',
    order: 7
  },
  {
    source: '2. 约束编程/08-ConstraintVerifier约束单元测试.md',
    output: '03-constraints/08-testing.md',
    section: 'constraints',
    order: 8
  },
  {
    source: '3. 求解算法配置/00-求解算法配置索引.md',
    output: '04-algorithms/00-index.md',
    section: 'algorithms',
    order: 0,
    isIndex: true
  },
  {
    source: '3. 求解算法配置/01-算法总览-CH-LS-ES.md',
    output: '04-algorithms/01-overview.md',
    section: 'algorithms',
    order: 1
  },
  {
    source: '3. 求解算法配置/02-构建启发式ConstructionHeuristic.md',
    output: '04-algorithms/02-construction-heuristic.md',
    section: 'algorithms',
    order: 2
  },
  {
    source: '3. 求解算法配置/03-局部搜索LocalSearch.md',
    output: '04-algorithms/03-local-search.md',
    section: 'algorithms',
    order: 3
  },
  {
    source: '3. 求解算法配置/04-MoveSelector移动选择器.md',
    output: '04-algorithms/04-move-selectors.md',
    section: 'algorithms',
    order: 4
  },
  {
    source: '3. 求解算法配置/05-穷举搜索与适用边界.md',
    output: '04-algorithms/05-exhaustive-search.md',
    section: 'algorithms',
    order: 5
  },
  {
    source: '3. 求解算法配置/06-终止条件-环境模式与可复现性.md',
    output: '04-algorithms/06-termination-reproducibility.md',
    section: 'algorithms',
    order: 6
  },
  {
    source: '4. BenchMark测试与配置/00-Benchmark测试索引.md',
    output: '05-benchmarking/00-index.md',
    section: 'benchmarking',
    order: 0,
    isIndex: true
  },
  {
    source: '4. BenchMark测试与配置/01-Benchmarker总览.md',
    output: '05-benchmarking/01-benchmarker.md',
    section: 'benchmarking',
    order: 1
  },
  {
    source: '4. BenchMark测试与配置/02-Benchmark配置文件.md',
    output: '05-benchmarking/02-configuration.md',
    section: 'benchmarking',
    order: 2
  },
  {
    source: '4. BenchMark测试与配置/03-SolutionFileIO与数据集管理.md',
    output: '05-benchmarking/03-datasets.md',
    section: 'benchmarking',
    order: 3
  },
  {
    source: '4. BenchMark测试与配置/04-报告解读与关键指标.md',
    output: '05-benchmarking/04-reports.md',
    section: 'benchmarking',
    order: 4
  },
  {
    source: '4. BenchMark测试与配置/05-统计基准与矩阵测试.md',
    output: '05-benchmarking/05-statistics.md',
    section: 'benchmarking',
    order: 5
  },
  {
    source: '4. BenchMark测试与配置/06-调优实验记录模板.md',
    output: '05-benchmarking/06-experiment-template.md',
    section: 'benchmarking',
    order: 6
  },
  {
    source: '5. 求解器的调优与扩展/00-调优与扩展索引.md',
    output: '06-tuning/00-index.md',
    section: 'tuning',
    order: 0,
    isIndex: true
  },
  {
    source: '5. 求解器的调优与扩展/01-性能调优清单.md',
    output: '06-tuning/01-performance-checklist.md',
    section: 'tuning',
    order: 1
  },
  {
    source: '5. 求解器的调优与扩展/02-动态约束与权重调参.md',
    output: '06-tuning/02-dynamic-constraints.md',
    section: 'tuning',
    order: 2
  },
  {
    source: '5. 求解器的调优与扩展/03-多线程与企业版边界.md',
    output: '06-tuning/03-multithreading-editions.md',
    section: 'tuning',
    order: 3
  },
  {
    source: '5. 求解器的调优与扩展/04-大规模排程建模策略.md',
    output: '06-tuning/04-large-scale-scheduling.md',
    section: 'tuning',
    order: 4
  },
  {
    source: '5. 求解器的调优与扩展/06-常见问题FAQ.md',
    output: '06-tuning/05-faq.md',
    section: 'tuning',
    order: 5
  },
  {
    source: '5. 求解器的调优与扩展/07-ProblemChange与实时增量更新.md',
    output: '06-tuning/06-problem-change.md',
    section: 'tuning',
    order: 6
  },
  {
    source: '5. 求解器的调优与扩展/08-Plus与Enterprise企业版功能详解.md',
    output: '06-tuning/07-commercial-editions.md',
    section: 'tuning',
    order: 7
  }
]

const publicVersionGuide = `## 30 秒速览

Timefold 的版本升级应按“当前依赖→目标版本→迁移指南→回归基准”的顺序进行。不要用 latest 文档直接推断已有代码的 API，也不要只因为新版本可用就跳过验证。

## 升级前先锁定基线

1. 从构建文件和 BOM 确认实际 Timefold 版本。
2. 记录 JDK、应用框架和 Timefold 集成模块的兼容范围。
3. 保存一组可重复的输入数据、得分、求解时间和可行性结果。
4. 为目标版本单独建立升级分支，避免在一次变更中同时改模型、约束和算法。

## 需要重点核对的内容

- Maven/Gradle 坐标、BOM 和 starter 名称。
- Java 版本、Spring Boot 或 Quarkus 的兼容性。
- 已弃用的注解、配置项和 API。
- Chained Variable、List Variable 与影子变量的建模方式。
- Constraint Streams 的语义、得分计算和解释结果。
- 社区版与商业版的能力边界。

## 安全的升级流程

1. 先阅读目标版本的发布说明与官方迁移指南。
2. 只升级依赖并修复编译错误，不同时调整业务规则。
3. 运行约束单元测试，核对硬约束可行性和每个约束的匹配数。
4. 使用同一数据集运行 Benchmark，比较得分质量、速度和内存。
5. 验证实时变更、持久化和并发调用等集成边界。

## 查阅方式

- 优先使用 [Timefold Solver 官方文档](https://docs.timefold.ai/timefold-solver/latest/) 查看目标版本要求。
- 对大版本迁移，逐项核对 [[07-1.x到2.x破坏性变更详解]]。

## 相关教程

- [[01-TimeFold是什么与适用场景]]
- [[03-Solver配置XML与代码配置]]
- [[08-Plus与Enterprise企业版功能详解]]
`

const publicOverviewVersion = `## 版本说明

- 这批笔记的原始知识骨架来自 Timefold Solver 1.31.0，适合用来建立领域建模、约束评分和求解流程的基础概念。
- 截至 2026-07-31，[Timefold Solver 官方 latest 文档](https://docs.timefold.ai/timefold-solver/latest/introduction) 指向 2.3.0-rc-1；[1.x 官方文档线](https://docs.timefold.ai/timefold-solver/1.x/introduction) 为 1.33.0。
- 版本号、依赖坐标和 API 以目标版本的官方文档为准；1.x → 2.x 的破坏性变更见 [[07-1.x到2.x破坏性变更详解]]。
- 商业版能力说明见 [[08-Plus与Enterprise企业版功能详解]]。
`

function normalizeRelative(value) {
  return value.replaceAll('\\', '/').normalize('NFC')
}

function keyFor(value) {
  return normalizeRelative(value).replace(/\.md$/i, '').toLocaleLowerCase('en-US')
}

function listMarkdownFiles(root) {
  const files = []

  function walk(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, item.name)
      if (item.isDirectory()) walk(absolutePath)
      else if (item.isFile() && item.name.toLowerCase().endsWith('.md')) files.push(absolutePath)
    }
  }

  walk(root)
  return files
}

function parseScalar(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return trimmed.slice(1, -1)
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1)
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  return trimmed
}

function parseTags(value) {
  const trimmed = value.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((tag) => parseScalar(tag))
    }
  }

  return [parseScalar(trimmed)]
}

function parseFrontmatter(
  markdown,
  sourceName,
  requiredFields = ['title', 'description', 'created']
) {
  const normalized = markdown.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  if (!match) throw new Error(`Missing frontmatter: ${sourceName}`)

  const lines = match[1].split('\n')
  const data = {}

  for (let index = 0; index < lines.length; index += 1) {
    const field = lines[index].match(/^([A-Za-z][\w-]*):(?:\s*(.*))?$/)
    if (!field) continue

    const [, name, rawValue = ''] = field
    if (name !== 'tags') {
      data[name] = parseScalar(rawValue)
      continue
    }

    if (rawValue.trim()) {
      data.tags = parseTags(rawValue)
      continue
    }

    const tags = []
    while (index + 1 < lines.length) {
      const listItem = lines[index + 1].match(/^\s+-\s+(.+)$/)
      if (!listItem) break
      tags.push(parseScalar(listItem[1]))
      index += 1
    }
    data.tags = tags
  }

  for (const requiredField of requiredFields) {
    if (!data[requiredField]) throw new Error(`Missing ${requiredField} in ${sourceName}`)
  }

  return { data, body: normalized.slice(match[0].length) }
}

function cleanTags(tags) {
  return [
    ...new Set(
      tags
        .map((tag) => String(tag).trim().replace(/^#+/, '').toLocaleLowerCase('en-US'))
        .filter(Boolean)
    )
  ]
}

function truncate(value, maximumLength) {
  const normalized = String(value).replace(/\s+/g, ' ').trim()
  return normalized.length <= maximumLength
    ? normalized
    : `${normalized.slice(0, maximumLength - 1).trimEnd()}…`
}

function serializeFrontmatter(entry, sourceData) {
  const section = sections[entry.section]
  const fields = [
    ['title', truncate(sourceData.title, 60)],
    ['description', truncate(sourceData.description, 160)],
    ['publishDate', String(sourceData.created)],
    ['updatedDate', UPDATED_DATE],
    ['tags', cleanTags(sourceData.tags ?? [])],
    ['order', entry.order],
    ['series', 'timefold'],
    ...(section.id ? [['section', section.id]] : []),
    ['sectionOrder', section.order],
    ['isIndex', Boolean(entry.isIndex)],
    ['source', 'Obsidian'],
    ['maturity', 'working']
  ]

  const yaml = fields.map(([name, value]) => {
    if (Array.isArray(value)) return `${name}: ${JSON.stringify(value)}`
    if (typeof value === 'number' || typeof value === 'boolean') return `${name}: ${value}`
    return `${name}: ${JSON.stringify(value)}`
  })

  return `---\n${yaml.join('\n')}\n---\n\n`
}

function parseWikilink(content) {
  const escapedAliasIndex = content.indexOf('\\|')
  const plainAliasIndex = content.indexOf('|')
  const aliasIndex = escapedAliasIndex >= 0 ? escapedAliasIndex : plainAliasIndex
  const aliasSeparatorLength = escapedAliasIndex >= 0 ? 2 : 1
  const targetWithFragment = aliasIndex >= 0 ? content.slice(0, aliasIndex) : content
  const alias = aliasIndex >= 0 ? content.slice(aliasIndex + aliasSeparatorLength) : ''
  const fragmentIndex = targetWithFragment.indexOf('#')
  const target =
    fragmentIndex >= 0 ? targetWithFragment.slice(0, fragmentIndex) : targetWithFragment
  const fragment = fragmentIndex >= 0 ? targetWithFragment.slice(fragmentIndex + 1) : ''

  return {
    target: target.trim().replace(/\.md$/i, ''),
    fragment: fragment.trim(),
    alias: alias.trim().replace(/\\([|#[\]])/g, '$1')
  }
}

function anchorFor(fragment) {
  return fragment
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\p{M}_-]/gu, '')
}

function escapeMarkdownText(value) {
  return String(value).replace(/([\[\]])/g, '\\$1')
}

function removeH2Section(body, heading) {
  const lines = body.split('\n')
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`)
  if (start < 0) return body

  let end = lines.length
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      end = index
      break
    }
  }

  return [...lines.slice(0, start), ...lines.slice(end)].join('\n')
}

function removeH2SectionIfEmpty(body, heading) {
  const lines = body.split('\n')
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`)
  if (start < 0) return body

  let end = lines.length
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      end = index
      break
    }
  }

  const hasContent = lines.slice(start + 1, end).some((line) => line.trim())
  return hasContent ? body : [...lines.slice(0, start), ...lines.slice(end)].join('\n')
}

function replaceH2Section(body, heading, replacement) {
  const lines = body.split('\n')
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`)
  if (start < 0) throw new Error(`Missing section "${heading}" in overview source`)

  let end = lines.length
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      end = index
      break
    }
  }

  return [
    ...lines.slice(0, start),
    ...replacement.trim().split('\n'),
    '',
    ...lines.slice(end)
  ].join('\n')
}

if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
  throw new Error(`Source directory does not exist: ${sourceRoot}`)
}

const sourceFiles = listMarkdownFiles(sourceRoot)
const sourcePathByKey = new Map(
  sourceFiles.map((absolutePath) => {
    const relativePath = normalizeRelative(path.relative(sourceRoot, absolutePath))
    return [keyFor(relativePath), absolutePath]
  })
)

if (sourceFiles.length !== EXPECTED_SOURCE_FILE_COUNT) {
  throw new Error(
    `Expected ${EXPECTED_SOURCE_FILE_COUNT} source notes, found ${sourceFiles.length} in ${sourceRoot}`
  )
}

const expectedSourceKeys = new Set(entries.map((entry) => keyFor(entry.source)))
const missingSources = entries.filter((entry) => !sourcePathByKey.has(keyFor(entry.source)))
const unexpectedSources = [...sourcePathByKey.keys()].filter((key) => !expectedSourceKeys.has(key))

if (missingSources.length || unexpectedSources.length !== 1) {
  const missingDetails = missingSources.map((entry) => `missing: ${entry.source}`).join('\n')
  throw new Error(
    `Source layout does not match the import map: ${missingSources.length} public notes missing, ` +
      `${unexpectedSources.length} private notes found.${missingDetails ? `\n${missingDetails}` : ''}`
  )
}

const privateSourcePath = sourcePathByKey.get(unexpectedSources[0])
const privateSource = normalizeRelative(path.relative(sourceRoot, privateSourcePath))
if (path.posix.dirname(privateSource) !== '5. 求解器的调优与扩展') {
  throw new Error('The private note is outside the expected tutorial section.')
}

entries.push({
  source: privateSource,
  output: null,
  section: 'tuning',
  order: 5,
  excluded: true
})

const entryByPath = new Map()
const entriesByBasename = new Map()

for (const entry of entries) {
  entryByPath.set(keyFor(entry.source), entry)
  const basename = keyFor(path.posix.basename(normalizeRelative(entry.source)))
  const existing = entriesByBasename.get(basename)
  if (existing) throw new Error(`Duplicate source basename: ${existing.source} and ${entry.source}`)
  entriesByBasename.set(basename, entry)
}

const documents = new Map()

for (const entry of entries) {
  const sourcePath = sourcePathByKey.get(keyFor(entry.source))
  const parsed = parseFrontmatter(fs.readFileSync(sourcePath, 'utf8'), entry.source)
  documents.set(entry, { sourcePath, ...parsed })
}

function resolveTutorialEntry(rawTarget, currentEntry) {
  let target = normalizeRelative(rawTarget.trim()).replace(/\.md$/i, '')
  if (!target) return currentEntry

  const lowerTarget = target.toLocaleLowerCase('en-US')
  const nestedMarker = '/timefold/'
  const markerIndex = lowerTarget.lastIndexOf(nestedMarker)
  if (markerIndex >= 0) target = target.slice(markerIndex + nestedMarker.length)
  else if (lowerTarget.startsWith('timefold/')) target = target.slice('timefold/'.length)

  const direct = entryByPath.get(keyFor(target))
  if (direct) return direct

  const currentDirectory = path.posix.dirname(normalizeRelative(currentEntry.source))
  const relativeTarget = path.posix.normalize(path.posix.join(currentDirectory, target))
  const relative = entryByPath.get(keyFor(relativeTarget))
  if (relative) return relative

  return entriesByBasename.get(keyFor(path.posix.basename(target))) ?? null
}

const sourceInventory = { total: 0, tutorial: 0, private: 0 }

for (const entry of entries) {
  const document = documents.get(entry)
  for (const match of document.body.matchAll(/\[\[([^\]]+)\]\]/g)) {
    sourceInventory.total += 1
    const { target } = parseWikilink(match[1])
    if (resolveTutorialEntry(target, entry)) sourceInventory.tutorial += 1
    else sourceInventory.private += 1
  }
}

if (sourceInventory.tutorial !== EXPECTED_TUTORIAL_WIKILINK_COUNT) {
  throw new Error(
    `Expected ${EXPECTED_TUTORIAL_WIKILINK_COUNT} tutorial wikilinks, found ${sourceInventory.tutorial}`
  )
}

function removePrivateReferenceLines(body, currentEntry) {
  return body
    .split('\n')
    .filter((line) => {
      for (const match of line.matchAll(/\[\[([^\]]+)\]\]/g)) {
        const { target } = parseWikilink(match[1])
        const linkedEntry = resolveTutorialEntry(target, currentEntry)
        if (!linkedEntry?.output) return false
      }
      return true
    })
    .join('\n')
}

const conversionStats = { tutorial: 0, private: 0 }

function convertWikilinks(body, currentEntry) {
  return body.replace(/\[\[([^\]]+)\]\]/g, (_wholeMatch, content) => {
    const { target, fragment, alias } = parseWikilink(content)
    const linkedEntry = resolveTutorialEntry(target, currentEntry)

    if (!linkedEntry || !linkedEntry.output) {
      conversionStats.private += 1
      return ''
    }

    conversionStats.tutorial += 1
    const linkedDocument = documents.get(linkedEntry)
    const display =
      alias || (target ? linkedDocument.data.title : fragment || linkedDocument.data.title)
    const anchor = fragment ? anchorFor(fragment) : ''
    const publicPath = `/docs/timefold/${linkedEntry.output.replace(/\.md$/i, '')}`
    return `[${escapeMarkdownText(display)}](${publicPath}${anchor ? `#${anchor}` : ''})`
  })
}

function transformBody(entry, originalBody) {
  let body = entry.transform === 'publicVersionGuide' ? publicVersionGuide : originalBody

  if (entry.transform === 'publicOverview') {
    body = replaceH2Section(body, '版本说明', publicOverviewVersion)
  }
  if (entry.section === 'overview') body = removeH2Section(body, '项目经验回链')
  body = removePrivateReferenceLines(body, entry)
  body = removeH2SectionIfEmpty(body, '关联项目')

  if (entry.transform === 'generalizeSchedulingExample') {
    const generalized = body.replace(
      /^## 与项目经验的关系[ \t]*\n\n在[^\n]+里，/m,
      '## 在生产排程场景中的应用\n\n在生产排程场景里，'
    )
    if (generalized === body) {
      throw new Error('Expected project-example section was not found for generalization.')
    }
    body = generalized
  }

  body = body.replace(/^\s*#(?!#)\s+[^\n]+\n(?:\s*\n)?/, '')
  body = convertWikilinks(body, entry)

  if (entry.isIndex) {
    body = body
      .replace(/`(https?:\/\/docs\.timefold\.ai\/[^`\s]+)`/g, '[官方文档]($1)')
      .replace(/\|\s*draft\s*\|/gi, '| 持续整理 |')
  }

  return `${body.trim()}\n`
}

if (path.basename(outputRoot) !== 'timefold' || !outputRoot.includes('/src/content/docs/')) {
  throw new Error(`Refusing to replace unexpected output path: ${outputRoot}`)
}

fs.rmSync(outputRoot, { recursive: true, force: true })
fs.mkdirSync(outputRoot, { recursive: true })

for (const entry of entries) {
  if (!entry.output) continue
  const document = documents.get(entry)
  const outputPath = path.join(outputRoot, entry.output)
  const frontmatter = serializeFrontmatter(entry, document.data)
  const body = transformBody(entry, document.body)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, frontmatter + body, 'utf8')
}

function assert(condition, message) {
  if (!condition) throw new Error(`Self-check failed: ${message}`)
}

const outputFiles = listMarkdownFiles(outputRoot)
const outputDocuments = outputFiles.map((file) => ({
  file,
  relative: normalizeRelative(path.relative(outputRoot, file)),
  text: fs.readFileSync(file, 'utf8')
}))
const allOutput = outputDocuments.map(({ text }) => text).join('\n')
const publicFilesByUrl = new Set(
  outputFiles.map(
    (file) =>
      `/docs/timefold/${normalizeRelative(path.relative(outputRoot, file)).replace(/\.md$/i, '')}`
  )
)

assert(
  outputFiles.length === EXPECTED_OUTPUT_FILE_COUNT,
  `expected 49 files, found ${outputFiles.length}`
)
assert(!allOutput.includes('[['), 'unconverted wikilinks remain')
assert(!/当前项目/.test(allOutput), 'current-project path or wording remains')
assert(!/项目实际依赖/.test(allOutput), 'project-specific dependency remains')
assert(!allOutput.includes(sourceRoot), 'absolute source vault path remains')
assert(
  !/(?:\/Users\/[^\s`]+\/Documents\/DATA\/Obsidian\/|[A-Za-z]:\\[^\s`]+Obsidian)/.test(allOutput),
  'absolute vault path remains'
)
assert(
  conversionStats.tutorial === 213,
  `expected 213 public tutorial links, found ${conversionStats.tutorial}`
)
assert(
  conversionStats.private === 0,
  `expected no retained private references, found ${conversionStats.private}`
)

for (const { file, relative, text } of outputDocuments) {
  const parsed = parseFrontmatter(text, relative, ['title', 'description', 'publishDate'])
  const mappedEntry = entries.find((entry) => entry.output === relative)
  const expectedSection = sections[mappedEntry.section]

  if (expectedSection.id) {
    assert(
      parsed.data.section === expectedSection.id,
      `${relative} has section ${parsed.data.section || '<missing>'}; expected ${expectedSection.id}`
    )
  } else {
    assert(!Object.hasOwn(parsed.data, 'section'), `${relative} must omit the section field`)
    assert(parsed.body.includes('截至 2026-07-31'), `${relative} lacks the dated version notice`)
    assert(parsed.body.includes('2.3.0-rc-1'), `${relative} lacks the current latest version`)
    assert(parsed.body.includes('1.33.0'), `${relative} lacks the current 1.x version`)
  }

  assert(
    !/^#(?!#)\s+/m.test(parsed.body.split(/^##\s+/m, 1)[0]),
    `${relative} keeps a duplicate H1`
  )

  if (relative.endsWith('/00-index.md')) {
    assert(
      !/`https?:\/\/docs\.timefold\.ai\//.test(parsed.body),
      `${relative} has a non-clickable official URL`
    )
  }

  for (const match of text.matchAll(/\]\((\/docs\/timefold\/[^)#\s]+)(?:#[^)]+)?\)/g)) {
    assert(publicFilesByUrl.has(match[1]), `${relative} links to missing page ${match[1]}`)
  }

  assert(file.startsWith(outputRoot + path.sep), `generated file escaped output root: ${file}`)
}

console.log(
  [
    'Timefold import complete.',
    `Source: ${sourceFiles.length} notes, ${sourceInventory.tutorial} tutorial wikilinks, ${sourceInventory.private} private wikilinks.`,
    `Output: ${outputFiles.length} notes, ${conversionStats.tutorial} public tutorial links, no retained private references.`,
    'Checks: no wikilinks or absolute vault paths.'
  ].join('\n')
)
