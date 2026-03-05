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
  'Particles Scale': '粒子缩放',
  'Max Velocity': '最大速度',
  'Mouse Radius': '鼠标影响范围',
  'Mouse Strength': '鼠标强度',
  'Trail Alpha': '尾迹透明度',
  'Point Size': '粒子尺寸',
  Jitter: '随机扰动',
  Scale: '缩放',
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
