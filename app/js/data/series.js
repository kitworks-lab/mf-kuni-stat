export const SERIES_YEARS = Array.from({ length: 31 }, (_, index) => 1995 + index);

const GFC = { from: 2008, to: 2009, label: 'GFC' };
const QUAKE = { from: 2011, to: 2011, label: 'Tohoku quake' };
const COVID = { from: 2020, to: 2020, label: 'COVID' };
const TAX = { from: 2014, to: 2014, label: 'VAT hike' };
const BUBBLE = { from: 1997, to: 1998, label: 'Asian crisis' };
const ENERGY = { from: 2022, to: 2023, label: 'Energy shock' };

function interpolate(anchors, digits) {
  const points = Object.entries(anchors)
    .map(([year, value]) => [Number(year), value])
    .sort((a, b) => a[0] - b[0]);
  const factor = 10 ** digits;
  return SERIES_YEARS.map((year) => {
    let lower = points[0];
    let upper = points[points.length - 1];
    for (let i = 0; i < points.length - 1; i += 1) {
      if (year >= points[i][0] && year <= points[i + 1][0]) {
        lower = points[i];
        upper = points[i + 1];
        break;
      }
    }
    const span = upper[0] - lower[0];
    const ratio = span === 0 ? 0 : (year - lower[0]) / span;
    return Math.round((lower[1] + (upper[1] - lower[1]) * ratio) * factor) / factor;
  });
}

function formatSigned(value, digits) {
  const text = Math.abs(value).toFixed(digits);
  return (value > 0 ? '+' : value < 0 ? '-' : '') + text;
}

function build(spec) {
  const values = spec.values ?? interpolate(spec.anchors, spec.digits);
  const latestValue = values[values.length - 1];
  const previous = values[values.length - 2];
  const change = Math.round((latestValue - previous) * 10 ** (spec.digits + 1)) / 10 ** (spec.digits + 1);
  const deltaText = `${formatSigned(change, spec.digits)} ${spec.deltaUnit} vs 2024`;
  const { anchors, deltaUnit, deltaOverride, ...rest } = spec;
  return { ...rest, latestYear: 2025, latestValue, deltaText: deltaOverride ?? deltaText, values };
}

const CPI_HEADLINE = interpolate(
  { 1995: 98.3, 1998: 99.9, 2005: 95.2, 2012: 95.9, 2013: 96.4, 2014: 99.0, 2019: 100.2, 2020: 100.0, 2021: 99.8, 2022: 102.3, 2023: 105.6, 2024: 108.5, 2025: 111.5 },
  1,
);

const SPECS = [
  {
    id: 'gdp-nominal', domain: 'economy', title: 'Nominal Gross Domestic Product', shortTitle: 'Nominal GDP',
    unit: '¥ Trillion', digits: 1, source: 'Cabinet Office', survey: 'National Accounts (SNA)', updated: '2026-03',
    frequency: 'Quarterly / Annual', baseNote: 'Current prices, calendar year',
    methodology: 'Total market value of final goods and services produced domestically, compiled under the 2008 SNA at current prices.',
    tone: 'up', deltaUnit: '¥T', bands: [GFC, QUAKE, COVID],
    anchors: { 1995: 504.0, 1997: 534.1, 2000: 509.0, 2009: 489.5, 2012: 495.0, 2019: 557.3, 2020: 539.0, 2022: 566.5, 2023: 580.0, 2024: 592.1, 2025: 609.3 },
    deltaOverride: '+2.9% YoY (+17.2 ¥T)',
  },
  {
    id: 'gdp-real-growth', domain: 'economy', title: 'Real GDP Growth', shortTitle: 'Real GDP growth',
    unit: '% YoY', digits: 1, source: 'Cabinet Office', survey: 'National Accounts (SNA)', updated: '2026-03',
    frequency: 'Quarterly / Annual', baseNote: 'Chain-linked volume, year-on-year change',
    methodology: 'Annual percentage change in chain-linked real GDP, removing the effect of price movements.',
    tone: 'up', deltaUnit: 'pt', bands: [BUBBLE, GFC, COVID],
    values: [2.6, 3.1, 0.9, -1.1, -0.3, 2.8, 0.4, 0.1, 1.5, 2.2, 1.8, 1.4, 1.5, -1.2, -5.7, 4.1, 0.0, 1.4, 2.0, 0.3, 1.6, 0.8, 1.7, 0.6, -0.4, -4.2, 2.7, 0.9, 1.4, 0.1, 1.1],
  },
  {
    id: 'gdp-per-capita', domain: 'economy', title: 'Nominal GDP per Capita', shortTitle: 'GDP per capita',
    unit: '¥ Thousands', digits: 0, source: 'Cabinet Office', survey: 'National Accounts (SNA)', updated: '2026-03',
    frequency: 'Annual', baseNote: 'Nominal GDP divided by total population',
    methodology: 'Nominal GDP divided by the mid-year total population estimate of the Statistics Bureau.',
    tone: 'up', deltaUnit: '¥k', bands: [GFC, COVID],
    anchors: { 1995: 4010, 2000: 4010, 2009: 3830, 2012: 3880, 2019: 4410, 2020: 4270, 2022: 4530, 2024: 4840, 2025: 4922 },
  },
  {
    id: 'household-income', domain: 'economy', title: 'Disposable Income per Household', shortTitle: 'Household income',
    unit: '¥ Thousands/yr', digits: 0, source: 'Ministry of Internal Affairs and Communications', survey: 'Family Income and Expenditure Survey', updated: '2026-02',
    frequency: 'Monthly / Annual', baseNote: 'Households of two or more persons, annualized',
    methodology: 'Annualized monthly disposable income (income net of taxes and social contributions) of two-or-more-person households.',
    tone: 'up', deltaUnit: '¥k', bands: [GFC, COVID],
    anchors: { 1995: 5600, 2005: 5100, 2012: 4800, 2019: 5150, 2020: 5300, 2024: 5410, 2025: 5480 },
  },
  {
    id: 'population-total', domain: 'population', title: 'Total Population', shortTitle: 'Population',
    unit: 'Millions', digits: 2, source: 'Statistics Bureau of Japan', survey: 'Population Estimates', updated: '2026-02',
    frequency: 'Monthly / Annual', baseNote: 'October 1 estimate, including foreign residents',
    methodology: 'Census-benchmarked estimate updated with vital statistics and migration records.',
    tone: 'down', deltaUnit: 'M', bands: [],
    anchors: { 1995: 125.57, 2000: 126.93, 2008: 128.08, 2015: 127.10, 2020: 126.15, 2024: 124.35, 2025: 123.80 },
    deltaOverride: '−0.44% YoY',
  },
  {
    id: 'aged-share', domain: 'population', title: 'Population Aged 65 and Over', shortTitle: 'Aged 65+ share',
    unit: '% aged 65+', digits: 1, source: 'Statistics Bureau of Japan', survey: 'Population Estimates', updated: '2026-02',
    frequency: 'Annual', baseNote: 'Share of total population',
    methodology: 'Residents aged 65 and over divided by the total population.',
    tone: 'up', deltaUnit: 'pt', bands: [],
    anchors: { 1995: 14.6, 2005: 20.2, 2015: 26.6, 2020: 28.6, 2024: 29.1, 2025: 29.3 },
    deltaOverride: '+0.2pp YoY',
  },
  {
    id: 'fertility-rate', domain: 'population', title: 'Total Fertility Rate', shortTitle: 'Fertility rate',
    unit: 'Births per woman', digits: 2, source: 'Ministry of Health, Labour and Welfare', survey: 'Vital Statistics', updated: '2026-06',
    frequency: 'Annual', baseNote: 'Japanese nationals in Japan',
    methodology: 'Sum of age-specific fertility rates for women aged 15 to 49 in a given year.',
    tone: 'down', deltaUnit: 'births', bands: [COVID],
    anchors: { 1995: 1.42, 2005: 1.26, 2015: 1.45, 2022: 1.26, 2023: 1.23, 2024: 1.20, 2025: 1.15 },
    deltaOverride: '−0.05 YoY',
  },
  {
    id: 'median-age', domain: 'population', title: 'Median Age of Population', shortTitle: 'Median age',
    unit: 'Years', digits: 1, source: 'Statistics Bureau of Japan', survey: 'Population Estimates', updated: '2026-02',
    frequency: 'Annual', baseNote: 'Age dividing the population into equal halves',
    methodology: 'Median of the single-year age distribution of the total population.',
    tone: 'up', deltaUnit: 'yr', bands: [],
    anchors: { 1995: 39.0, 2005: 43.0, 2015: 46.4, 2020: 48.4, 2025: 49.5 },
  },
  {
    id: 'unemployment', domain: 'labour', title: 'Unemployment Rate', shortTitle: 'Unemployment',
    unit: '%', digits: 1, source: 'Statistics Bureau of Japan', survey: 'Labour Force Survey', updated: '2026-03',
    frequency: 'Monthly / Annual', baseNote: 'Annual average, persons aged 15 and over',
    methodology: 'Unemployed persons as a share of the labour force, following ILO definitions.',
    tone: 'neutral', deltaUnit: 'pt', bands: [GFC, COVID],
    values: [3.2, 3.4, 3.4, 4.1, 4.7, 4.7, 5.0, 5.4, 5.3, 4.7, 4.4, 4.1, 3.9, 4.0, 5.1, 5.1, 4.6, 4.3, 4.0, 3.6, 3.4, 3.1, 2.8, 2.4, 2.4, 2.8, 2.8, 2.6, 2.6, 2.6, 2.5],
    deltaOverride: '−0.1pp YoY',
  },
  {
    id: 'employment-rate', domain: 'labour', title: 'Employment Rate, Aged 15-64', shortTitle: 'Employment rate',
    unit: '% aged 15-64', digits: 1, source: 'Statistics Bureau of Japan', survey: 'Labour Force Survey', updated: '2026-03',
    frequency: 'Monthly / Annual', baseNote: 'Annual average',
    methodology: 'Employed persons aged 15 to 64 divided by the population of the same age group.',
    tone: 'up', deltaUnit: 'pt', bands: [GFC, COVID],
    anchors: { 1995: 69.5, 2002: 67.9, 2009: 69.5, 2012: 71.7, 2019: 76.9, 2020: 77.3, 2023: 78.7, 2024: 79.3, 2025: 79.6 },
  },
  {
    id: 'wage-index', domain: 'labour', title: 'Nominal Cash Earnings Index', shortTitle: 'Wage index',
    unit: 'Index 2020=100', digits: 1, source: 'Ministry of Health, Labour and Welfare', survey: 'Monthly Labour Survey', updated: '2026-03',
    frequency: 'Monthly / Annual', baseNote: '2020=100, establishments with 5+ employees',
    methodology: 'Total cash earnings per regular employee, including scheduled, overtime and special payments, rebased to 2020.',
    tone: 'up', deltaUnit: 'pts', bands: [GFC, COVID],
    anchors: { 1995: 107.5, 1997: 109.5, 2009: 99.0, 2012: 96.8, 2020: 100.0, 2024: 104.9, 2025: 108.4 },
  },
  {
    id: 'cpi-core', domain: 'prices', title: 'Core CPI Inflation (ex. Fresh Food)', shortTitle: 'Core CPI',
    unit: '% YoY ex-fresh food', digits: 1, source: 'Statistics Bureau of Japan', survey: 'Consumer Price Index', updated: '2026-03',
    frequency: 'Monthly / Annual', baseNote: 'Annual average, 2020 base',
    methodology: 'Year-on-year change in the all-items CPI excluding fresh food.',
    tone: 'up', deltaUnit: 'pt', deltaOverride: '+0.2pp YoY', bands: [TAX, ENERGY],
    values: [-0.1, 0.1, 1.8, 0.6, -0.3, -0.4, -0.8, -0.9, -0.3, 0.0, -0.1, 0.1, 0.0, 1.5, -1.3, -1.0, -0.3, 0.0, 0.4, 2.6, 0.5, -0.2, 0.5, 0.8, 0.6, -0.2, -0.2, 3.0, 3.1, 2.5, 2.7],
  },
  {
    id: 'cpi-headline', domain: 'prices', title: 'All-Items Consumer Price Index', shortTitle: 'CPI (all items)',
    unit: 'Index 2020=100', digits: 1, source: 'Statistics Bureau of Japan', survey: 'Consumer Price Index', updated: '2026-03',
    frequency: 'Monthly / Annual', baseNote: '2020=100, annual average',
    methodology: 'Laspeyres-type index of a fixed basket of household consumption, rebased to 2020.',
    tone: 'up', deltaUnit: 'pts', bands: [TAX, ENERGY],
    values: CPI_HEADLINE,
  },
  {
    id: 'yen-purchasing-power', domain: 'prices', title: 'Real Yen Purchasing Power Index', shortTitle: 'Yen purchasing power',
    unit: 'Index 1995=100', digits: 1, source: 'Derived from Statistics Bureau of Japan CPI', survey: 'Consumer Price Index (derived)', updated: '2026-03',
    frequency: 'Annual', baseNote: '1995=100; inverse of all-items CPI',
    methodology: 'Ratio of the 1995 all-items CPI to the current-year CPI, scaled to 100 in 1995.',
    tone: 'down', deltaUnit: 'pts', bands: [TAX, ENERGY],
    values: CPI_HEADLINE.map((value) => Math.round((CPI_HEADLINE[0] / value) * 1000) / 10),
  },
  {
    id: 'exports', domain: 'trade', title: 'Merchandise Exports', shortTitle: 'Exports',
    unit: '¥ Trillion', digits: 1, source: 'Ministry of Finance', survey: 'Trade Statistics of Japan', updated: '2026-02',
    frequency: 'Monthly / Annual', baseNote: 'Customs clearance basis, calendar year',
    methodology: 'Value of goods leaving Japanese customs territory, recorded on a customs clearance basis.',
    tone: 'up', deltaUnit: '¥T', bands: [GFC, QUAKE, COVID],
    anchors: { 1995: 41.5, 2000: 51.6, 2007: 83.9, 2009: 54.2, 2013: 69.8, 2018: 81.5, 2020: 68.4, 2022: 98.2, 2023: 100.9, 2024: 107.0, 2025: 109.4 },
  },
  {
    id: 'trade-balance', domain: 'trade', title: 'Merchandise Trade Balance', shortTitle: 'Trade balance',
    unit: '¥ Trillion', digits: 1, source: 'Ministry of Finance', survey: 'Trade Statistics of Japan', updated: '2026-02',
    frequency: 'Monthly / Annual', baseNote: 'Exports minus imports, customs clearance basis',
    methodology: 'Merchandise exports minus merchandise imports on a customs clearance basis.',
    tone: 'neutral', deltaUnit: '¥T', bands: [QUAKE, ENERGY],
    anchors: { 1995: 12.0, 2000: 7.1, 2007: 10.8, 2009: 3.4, 2011: -2.6, 2014: -12.8, 2016: 4.0, 2019: -1.5, 2022: -19.9, 2023: -9.3, 2024: -5.3, 2025: -4.2 },
  },
  {
    id: 'life-expectancy', domain: 'society', title: 'Combined Life Expectancy at Birth', shortTitle: 'Life expectancy',
    unit: 'Years', digits: 1, source: 'Ministry of Health, Labour and Welfare', survey: 'Abridged Life Tables', updated: '2026-07',
    frequency: 'Annual', baseNote: 'Average of male and female life expectancy',
    methodology: 'Average number of years a newborn is expected to live under current age-specific mortality, averaged across sexes.',
    tone: 'neutral', deltaUnit: 'yr', bands: [COVID],
    anchors: { 1995: 79.6, 2005: 82.1, 2015: 83.8, 2019: 84.4, 2021: 84.5, 2022: 84.4, 2023: 84.3, 2024: 84.2, 2025: 84.1 },
  },
  {
    id: 'social-security', domain: 'society', title: 'Social Security Benefits', shortTitle: 'Social security',
    unit: '¥ Trillion', digits: 1, source: 'National Institute of Population and Social Security Research', survey: 'Social Security Expenditure Statistics', updated: '2026-01',
    frequency: 'Annual', baseNote: 'Fiscal year, pensions, health care and welfare',
    methodology: 'Total benefits for pensions, medical care and welfare under the ILO-style social security classification.',
    tone: 'up', deltaUnit: '¥T', bands: [COVID],
    anchors: { 1995: 64.7, 2000: 78.1, 2010: 105.4, 2019: 123.9, 2020: 132.2, 2021: 138.7, 2025: 138.6 },
  },
];

export const INDICATORS = SPECS.map(build);

export function getIndicatorById(id) {
  return INDICATORS.find((indicator) => indicator.id === id) ?? null;
}

export function getIndicatorsByDomain(domain) {
  return INDICATORS.filter((indicator) => indicator.domain === domain);
}