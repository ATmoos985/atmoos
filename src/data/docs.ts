export type DocsSectionMeta = {
  id: string
  number: string
  title: string
  shortTitle: string
  summary: string
}

export type DocsSeriesMeta = {
  id: string
  number: string
  title: string
  shortTitle: string
  eyebrow: string
  summary: string
  description: string
  color: string
  sections: DocsSectionMeta[]
}

export const docsSeries: DocsSeriesMeta[] = [
  {
    id: 'timefold',
    number: '01',
    title: 'Timefold Solver 求解器教程',
    shortTitle: 'Timefold Solver',
    eyebrow: 'Solver notebook / 01',
    summary: '从领域建模、约束评分到算法配置与 Benchmark 的系统笔记。',
    description:
      '一组从 Obsidian 筛选并公开的工作笔记，记录如何把真实排程问题翻译成可验证、可调优的 Timefold 模型。',
    color: '#d65a34',
    sections: [
      {
        id: '01-getting-started',
        number: '01',
        title: '配置与运行',
        shortTitle: '配置',
        summary: '认识 Timefold，接入依赖，配置并运行第一个 Solver。'
      },
      {
        id: '02-domain-modeling',
        number: '02',
        title: '领域模型建模',
        shortTitle: '建模',
        summary: '把业务对象拆成事实、规划实体、变量、影子变量与规划解。'
      },
      {
        id: '03-constraints',
        number: '03',
        title: '约束与评分',
        shortTitle: '约束',
        summary: '用 Constraint Streams 表达规则，并让 Score 可解释、可测试。'
      },
      {
        id: '04-algorithms',
        number: '04',
        title: '求解算法配置',
        shortTitle: '算法',
        summary: '理解构建启发式、局部搜索、Move 与终止条件。'
      },
      {
        id: '05-benchmarking',
        number: '05',
        title: 'Benchmark 实验',
        shortTitle: '实验',
        summary: '用统一数据集和指标比较配置，让调参可以复现。'
      },
      {
        id: '06-tuning',
        number: '06',
        title: '调优与扩展',
        shortTitle: '调优',
        summary: '从模型、约束、算法和数据规模四层进入真实问题。'
      }
    ]
  }
]

export const getSeriesMeta = (id?: string) => docsSeries.find((series) => series.id === id)

export const getSectionMeta = (seriesId?: string, sectionId?: string) =>
  getSeriesMeta(seriesId)?.sections.find((section) => section.id === sectionId)
