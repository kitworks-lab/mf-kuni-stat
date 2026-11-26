export const NATIONAL_KPIS = [
  { id: 'population-total', label: 'Total Population', figure: '123.80M', delta: -0.44, deltaText: '−0.44% YoY', tone: 'down', spark: [127.1, 126.9, 126.7, 126.4, 126.2, 125.5, 124.9, 124.6, 124.35, 123.8], source: 'Statistics Bureau of Japan · Oct 2025' },
  { id: 'gdp-nominal', label: 'Nominal GDP', figure: '¥609.3T', delta: 2.9, deltaText: '+2.9% YoY (+17.2 ¥T)', tone: 'up', spark: [544.8, 553.1, 556.6, 556.6, 539.0, 550.5, 566.5, 580.0, 592.1, 609.3], source: 'Cabinet Office ESRI · FY2025' },
  { id: 'cpi-core', label: 'Core CPI (ex-fresh food)', figure: '+2.7%', delta: 0.2, deltaText: '+0.2pp YoY', tone: 'down', spark: [-0.2, 0.5, 0.9, 0.6, -0.2, -0.2, 3.0, 3.1, 2.5, 2.7], source: 'Statistics Bureau of Japan · 2025' },
  { id: 'unemployment', label: 'Unemployment Rate', figure: '2.5%', delta: -0.1, deltaText: '−0.1pp YoY', tone: 'up', spark: [3.1, 2.8, 2.4, 2.4, 2.8, 2.8, 2.6, 2.6, 2.6, 2.5], source: 'Labour Force Survey · 2025' },
  { id: 'aged-share', label: 'Aged 65+ Share', figure: '29.3%', delta: 0.2, deltaText: '+0.2pp YoY', tone: 'down', spark: [27.3, 27.7, 28.1, 28.4, 28.6, 28.9, 29.0, 29.1, 29.1, 29.3], source: 'Population Estimates · 2025' },
  { id: 'fertility-rate', label: 'Total Fertility Rate', figure: '1.15', delta: -0.05, deltaText: '−0.05 YoY', tone: 'down', spark: [1.44, 1.43, 1.42, 1.36, 1.34, 1.30, 1.26, 1.26, 1.20, 1.15], source: 'MHLW Vital Statistics · 2025 est.' },
];

export const MACRO_PULSE = {
  years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  gdp: [2.8, 0.4, 0.1, 1.5, 2.2, 1.8, 1.4, 1.5, -1.2, -5.7, 4.1, 0.0, 1.4, 2.0, 0.3, 1.6, 0.8, 1.7, 0.6, -0.4, -4.1, 2.6, 1.0, 1.2, 0.1, 1.1],
  cpi: [-0.4, -0.8, -0.9, -0.3, 0.0, -0.1, 0.1, 0.0, 1.2, -1.3, -1.0, -0.3, 0.0, 0.4, 2.6, 0.5, -0.2, 0.5, 0.9, 0.6, -0.2, -0.2, 3.0, 3.1, 2.5, 2.7],
  bands: [{ from: 2008, to: 2009, label: 'GFC' }, { from: 2020, to: 2020, label: 'COVID' }],
};

export const AGE_PYRAMID = [
  { label: '0-9', male: 2.90, female: 2.75, male2000: 4.60, female2000: 4.40 },
  { label: '10-19', male: 4.50, female: 4.30, male2000: 5.30, female2000: 5.00 },
  { label: '20-29', male: 5.30, female: 5.05, male2000: 6.60, female2000: 6.30 },
  { label: '30-39', male: 5.20, female: 5.00, male2000: 7.30, female2000: 7.20 },
  { label: '40-49', male: 6.30, female: 6.10, male2000: 6.30, female2000: 6.20 },
  { label: '50-59', male: 7.10, female: 7.00, male2000: 7.20, female2000: 7.40 },
  { label: '60-69', male: 5.90, female: 6.20, male2000: 5.50, female2000: 6.00 },
  { label: '70-79', male: 6.20, female: 7.50, male2000: 3.40, female2000: 4.60 },
  { label: '80-89', male: 3.00, female: 4.70, male2000: 1.10, female2000: 2.00 },
  { label: '90+', male: 0.50, female: 1.40, male2000: 0.10, female2000: 0.30 },
];

export const TOPIC_DOMAINS = [
  { id: 'economy', name: 'Economy', count: 4, summary: 'National accounts, output, income and corporate activity.', highlight: 'Nominal GDP ¥609.3T' },
  { id: 'population', name: 'Population', count: 4, summary: 'Size, age structure, households, births and migration.', highlight: 'Aged 65+ 29.3%' },
  { id: 'labour', name: 'Labour', count: 3, summary: 'Employment, wages and working hours.', highlight: 'Unemployment 2.5%' },
  { id: 'prices', name: 'Prices', count: 3, summary: 'Consumer prices, inflation and purchasing power.', highlight: 'Core CPI +2.7%' },
  { id: 'trade', name: 'Trade', count: 2, summary: 'Exports, imports and the external balance.', highlight: 'Trade in goods, annual' },
  { id: 'society', name: 'Society', count: 2, summary: 'Health, life expectancy and social security.', highlight: 'TFR 1.20 (2024 est.)' },
];

export const HEADLINE_RELEASES = [
  { date: '2025-11-14', agency: 'Cabinet Office ESRI', title: 'Quarterly Estimates of GDP, Jul–Sep 2025 (preliminary)', figure: 'Real GDP, annualised q/q', link: '#/releases' },
  { date: '2025-11-21', agency: 'Statistics Bureau of Japan', title: 'Consumer Price Index, October 2025', figure: 'Core CPI +2.7% YoY', link: '#/releases' },
  { date: '2025-11-28', agency: 'Statistics Bureau of Japan', title: 'Labour Force Survey, October 2025', figure: 'Unemployment 2.5%', link: '#/releases' },
  { date: '2025-09-15', agency: 'Statistics Bureau of Japan', title: 'Population Estimates: Respect-for-the-Aged Day statistics', figure: 'Aged 65+ 29.3%', link: '#/releases' },
  { date: '2025-06-04', agency: 'Ministry of Health, Labour and Welfare', title: 'Vital Statistics: Births and Fertility, 2024', figure: 'TFR 1.15 (2024)', link: '#/releases' },
];

const IND = (id, label, topic) => ({ type: 'Indicator', id, label, href: '#/indicator/' + id, topic });
export const SEARCH_INDEX = [
  IND('population-total', 'Total Population', 'population'),
  IND('aged-share', 'Aged 65+ Share', 'population'),
  IND('fertility-rate', 'Total Fertility Rate', 'population'),
  IND('median-age', 'Median Age', 'population'),
  IND('gdp-nominal', 'Nominal GDP', 'economy'),
  IND('gdp-real-growth', 'Real GDP Growth', 'economy'),
  IND('gdp-per-capita', 'GDP per Capita', 'economy'),
  IND('household-income', 'Household Disposable Income', 'economy'),
  IND('unemployment', 'Unemployment Rate', 'labour'),
  IND('employment-rate', 'Employment Rate', 'labour'),
  IND('wage-index', 'Nominal Wage Index', 'labour'),
  IND('cpi-core', 'Core CPI (ex-fresh food)', 'prices'),
  IND('cpi-headline', 'Headline CPI', 'prices'),
  IND('yen-purchasing-power', 'Yen Purchasing Power', 'prices'),
  IND('exports', 'Exports of Goods', 'trade'),
  IND('trade-balance', 'Trade Balance', 'trade'),
  IND('life-expectancy', 'Life Expectancy at Birth', 'society'),
  IND('social-security', 'Social Security Expenditure', 'society'),
  { type: 'Prefecture', id: 'TKY', label: 'Tokyo', href: '#/regions?pref=TKY' },
  { type: 'Prefecture', id: 'OSK', label: 'Osaka', href: '#/regions?pref=OSK' },
  { type: 'Prefecture', id: 'HKD', label: 'Hokkaido', href: '#/regions?pref=HKD' },
  { type: 'Prefecture', id: 'AKT', label: 'Akita', href: '#/regions?pref=AKT' },
  { type: 'Prefecture', id: 'OKN', label: 'Okinawa', href: '#/regions?pref=OKN' },
  { type: 'Prefecture', id: 'AIC', label: 'Aichi', href: '#/regions?pref=AIC' },
  { type: 'Tool', id: 'purchasing-power', label: 'Yen Purchasing Power Calculator', href: '#/tools' },
  { type: 'Tool', id: 'compare', label: 'Prefecture Comparator', href: '#/regions' },
  { type: 'Page', id: 'releases', label: 'Release Calendar and Open Data', href: '#/releases' },
];