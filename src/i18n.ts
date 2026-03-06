import type { Language } from './ui/UIContext';

type LocaleText = {
  navGallery: string;
  navGithubLabel: string;
  navLanguageToggle: string;
  navThemeToggle: string;
  langZh: string;
  langEn: string;
  themeLight: string;
  themeDark: string;
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  livePreview: string;
  exploreTemplate: string;
  notFoundTitle: string;
  notFoundButton: string;
  tabConfig: string;
  tabCode: string;
  panelTitle: string;
  codeHint: string;
  detailCopy: string;
  detailCopied: string;
  modeLabel: string;
};

export const localeText: Record<Language, LocaleText> = {
  zh: {
    navGallery: '作品库',
    navGithubLabel: '打开 GitHub 仓库',
    navLanguageToggle: '切换语言',
    navThemeToggle: '切换明暗模式',
    langZh: '中',
    langEn: 'EN',
    themeLight: '浅色',
    themeDark: '夜间',
    heroBadge: 'Canvas 动效灵感库',
    heroTitleLine1: '让你的首页第一屏',
    heroTitleLine2: '更有动态质感',
    heroDescription: '直接预览、实时调参、复制代码。每个背景都面向展示型网站优化，适合品牌官网、作品集和活动落地页。',
    livePreview: '实时预览',
    exploreTemplate: '查看模板',
    notFoundTitle: '未找到该背景',
    notFoundButton: '返回作品库',
    tabConfig: '参数',
    tabCode: '代码',
    panelTitle: '控制面板',
    codeHint: '支持直接复制 HTML 或 JavaScript 代码。建议先在当前页面调好参数，再粘贴到你的项目。',
    detailCopy: '复制',
    detailCopied: '已复制',
    modeLabel: '模式',
  },
  en: {
    navGallery: 'Gallery',
    navGithubLabel: 'Open GitHub repository',
    navLanguageToggle: 'Toggle language',
    navThemeToggle: 'Toggle theme',
    langZh: '中',
    langEn: 'EN',
    themeLight: 'Light',
    themeDark: 'Dark',
    heroBadge: 'Canvas Motion Library',
    heroTitleLine1: 'Make your website hero',
    heroTitleLine2: 'feel alive and premium',
    heroDescription: 'Preview instantly, tweak controls in real time, then copy the React snippet. Built for portfolios, product sites, and campaign landing pages.',
    livePreview: 'Live Preview',
    exploreTemplate: 'Explore Template',
    notFoundTitle: 'Background not found',
    notFoundButton: 'Return to Gallery',
    tabConfig: 'Config',
    tabCode: 'Code',
    panelTitle: 'Control Panel',
    codeHint: 'Copy either the HTML or JavaScript snippet directly. Tune the visual parameters first, then paste into your project.',
    detailCopy: 'Copy',
    detailCopied: 'Copied!',
    modeLabel: 'Mode',
  },
};

const zhBackgroundText: Record<string, { name: string; description: string }> = {
  particles: {
    name: '粒子网络',
    description: '可交互的连接粒子网络，适合科技感与数据感场景。',
  },
  waves: {
    name: '海浪曲面',
    description: '多层正弦波叠加形成柔和流动感，适合品牌展示页。',
  },
  gradient: {
    name: '流体渐变',
    description: '有机流动的径向渐变色块，适合视觉主屏和活动页。',
  },
  confetti: {
    name: '彩屑漂流',
    description: '彩色粒子缓慢飘落并受鼠标水平影响，氛围感更轻松活泼。',
  },
  'text-flow': {
    name: '文字流场',
    description: '粒子从文字中喷涌并在流场和重力影响下运动，适合品牌主视觉。',
  },
  magnetic: {
    name: '磁性流场',
    description: '发光粒子会被鼠标吸引并带出拖尾，适合科技感主视觉。',
  },
  'antigravity-ring': {
    name: '反重力环流',
    description: '空心环状短划粒子场，跟随鼠标并带有局部色带变化。',
  },
  'cursor-trail': {
    name: '鼠标尾迹',
    description: '高密度微粒随鼠标扰动并留下柔滑尾迹，适合深色背景。',
  },
  'stardust-burst': {
    name: '星尘爆发',
    description: '点击触发星尘爆发，支持拖尾、重力和颜色漂移，适合活动页和主视觉。',
  },
  'fireworks-burst': {
    name: '烟花爆发',
    description: '点击或触摸触发彩色粒子爆发，并带有冲击波圆环扩散效果。',
  },
  'edge-link': {
    name: '边缘连线',
    description: '粒子从四周缓慢进入并呼吸闪烁，接近鼠标时形成动态连线网络。',
  },
  'starfield-warp': {
    name: '星际穿梭',
    description: '复古 3D 星空穿梭效果，支持 Warp 拖尾与透视速度调节。',
  },
};

const zhConfigLabelMap: Record<string, string> = {
  'Background Color': '背景颜色',
  'Particle Color': '粒子颜色',
  'Particle Count': '粒子数量',
  'Connection Distance': '连线距离',
  'Line Color': '连线颜色',
  'Node Color': '节点颜色',
  'Grid Step': '网格步长',
  'Neighbor Count': '邻居数量',
  'Move Range': '漂移范围',
  'Move Speed': '漂移速度',
  'Confetti Count': '彩屑数量',
  'Size Min': '最小尺寸',
  'Size Max': '最大尺寸',
  'Fall Speed': '下落速度',
  'Horizontal Drift': '水平漂移',
  'Mouse Influence': '鼠标影响',
  'Fade Speed': '淡入淡出速度',
  'Color A': '颜色 A',
  'Color B': '颜色 B',
  'Color C': '颜色 C',
  'Color D': '颜色 D',
  'Color E': '颜色 E',
  Text: '文字',
  Flow: '流场力度',
  'Top Speed': '最大速度',
  Lifespan: '生命周期',
  'Flow Offset': '流场偏移',
  'Gravity Direction': '重力方向',
  'Gravity Force': '重力强度',
  'Particle Scale': '粒子缩放',
  Speed: '速度',
  'Wave Color Start': '波形起始色',
  'Wave Color End': '波形结束色',
  'Wave Count': '波浪层数',
  Amplitude: '振幅',
  Frequency: '频率',
  'Color 1': '颜色 1',
  'Color 2': '颜色 2',
  'Color 3': '颜色 3',
  'Glow Color': '辉光颜色',
  'Particle Size': '粒子大小',
  'Pointer Radius': '鼠标影响半径',
  'Pointer Smoothing': '鼠标平滑度',
  'Node Radius Min': '节点最小半径',
  'Node Radius Max': '节点最大半径',
  'Line Width': '线宽',
  'Idle Line Alpha': '空闲线透明度',
  'Idle Node Alpha': '空闲点透明度',
  'Idle Drift': '空闲漂移',
  'Pointer Force': '鼠标牵引力',
  Friction: '阻尼',
  Drift: '随机漂移',
  'Ring Radius': '环半径',
  'Ring Width': '环宽 1',
  'Ring Width 2': '环宽 2',
  'Ring Displacement': '环位移强度',
  'Noise Amount': '噪声强度',
  Density: '密度',
  'Particle Limit': '粒子上限',
  'Particles Scale': '粒子缩放',
  'Max Velocity': '最大速度',
  'Mouse Radius': '鼠标影响范围',
  'Mouse Strength': '鼠标强度',
  'Trail Alpha': '尾迹透明度',
  'Point Size': '粒子尺寸',
  Jitter: '随机扰动',
  Scale: '缩放',
  'Max Particle Size': '粒子最大尺寸',
  'Color Variation': '颜色波动',
  'Background Fade': '背景淡化',
  'Auto Burst': '自动爆发',
  'Auto Burst Interval': '自动爆发间隔',
  'Particle Radius Min': '粒子最小半径',
  'Particle Radius Max': '粒子最大半径',
  'Spread Min': '最小扩散半径',
  'Spread Max': '最大扩散半径',
  'Duration Min': '最短时长',
  'Duration Max': '最长时长',
  'Ring Radius Min': '圆环最小半径',
  'Ring Radius Max': '圆环最大半径',
  'Ring Line Width': '圆环线宽',
  'Fade Alpha': '残影透明度',
  'Auto Burst Jitter': '自动爆发抖动',
  'Stop Auto On Interact': '交互后停止自动',
  'Ball Count': '球体数量',
  'Ball Radius': '球体半径',
  'Speed Min': '最小速度',
  'Speed Max': '最大速度',
  'Distance Limit': '连线阈值距离',
  'Pulse Speed': '呼吸速度',
  'Enable Mouse Node': '启用鼠标节点',
  'Spawn Padding': '出生边距',
  'Bounds Padding': '边界留白',
  'Star Color': '星点颜色',
  'Star Count': '星点数量',
  'Focal Length': '焦距',
  'Base Speed': '基础速度',
  'Warp Enabled': '启用 Warp',
  'Warp Speed': 'Warp 速度',
  'Trail Fade': '拖尾淡化',
  'Max Depth': '最大深度',
  'Star Size': '星点尺寸',
  'Min Opacity': '最小透明度',
  'Max Opacity': '最大透明度',
};

export function getBackgroundLocalized(
  language: Language,
  id: string,
  fallbackName: string,
  fallbackDescription: string
) {
  if (language === 'zh' && zhBackgroundText[id]) {
    return zhBackgroundText[id];
  }
  return { name: fallbackName, description: fallbackDescription };
}

export function getConfigLabelLocalized(language: Language, label: string) {
  if (language === 'zh') {
    return zhConfigLabelMap[label] ?? label;
  }
  return label;
}
