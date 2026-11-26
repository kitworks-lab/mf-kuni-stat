export const RELEASE_CALENDAR = [
  { date: '2025-05-16', agency: 'Cabinet Office', domain: 'economy', title: 'GDP Preliminary, Jan-Mar 2025', frequency: 'Quarterly', status: 'Published', headline: 'Real GDP contracted slightly on weaker net exports', indicatorId: 'gdp-real-growth' },
  { date: '2025-06-04', agency: 'Ministry of Health, Labour and Welfare', domain: 'population', title: 'Vital Statistics, 2024 Annual Estimates', frequency: 'Annual', status: 'Published', headline: 'Fertility rate fell to a record low of 1.15', indicatorId: 'fertility-rate' },
  { date: '2025-08-15', agency: 'Cabinet Office', domain: 'economy', title: 'GDP Preliminary, Apr-Jun 2025', frequency: 'Quarterly', status: 'Published', headline: 'Economy expanded modestly on private consumption', indicatorId: 'gdp-nominal' },
  { date: '2025-09-02', agency: 'Ministry of Finance', domain: 'trade', title: 'Trade Statistics, August 2025', frequency: 'Monthly', status: 'Published', headline: 'Exports edged higher; trade deficit narrowed', indicatorId: 'trade-balance' },
  { date: '2025-09-14', agency: 'Statistics Bureau of Japan', domain: 'population', title: 'Population Estimates, Respect for the Aged Day Release', frequency: 'Annual', status: 'Published', headline: 'Share of residents aged 65+ held near 29.3%', indicatorId: 'aged-share' },
  { date: '2025-10-24', agency: 'Statistics Bureau of Japan', domain: 'prices', title: 'Consumer Price Index, September 2025', frequency: 'Monthly', status: 'Published', headline: 'Core CPI stayed above the 2% level', indicatorId: 'cpi-core' },
  { date: '2025-12-19', agency: 'Statistics Bureau of Japan', domain: 'prices', title: 'Consumer Price Index, November 2025', frequency: 'Monthly', status: 'Published', headline: 'All-items index rose on food and energy costs', indicatorId: 'cpi-headline' },
  { date: '2026-01-30', agency: 'Statistics Bureau of Japan', domain: 'labour', title: 'Labour Force Survey, December 2025', frequency: 'Monthly', status: 'Published', headline: 'Unemployment remained at 2.5%', indicatorId: 'unemployment' },
  { date: '2026-02-09', agency: 'Ministry of Health, Labour and Welfare', domain: 'labour', title: 'Monthly Labour Survey, December 2025', frequency: 'Monthly', status: 'Published', headline: 'Nominal cash earnings continued to rise', indicatorId: 'wage-index' },
  { date: '2026-03-10', agency: 'Cabinet Office', domain: 'economy', title: 'GDP Revised, Oct-Dec 2025', frequency: 'Quarterly', status: 'Published', headline: 'Annual nominal GDP reached about 609 trillion yen', indicatorId: 'gdp-nominal' },
  { date: '2026-05-18', agency: 'Cabinet Office', domain: 'economy', title: 'GDP Preliminary, Jan-Mar 2026', frequency: 'Quarterly', status: 'Scheduled', headline: 'First estimate of 2026 growth', indicatorId: 'gdp-real-growth' },
  { date: '2026-06-03', agency: 'Ministry of Health, Labour and Welfare', domain: 'population', title: 'Vital Statistics, 2025 Annual Estimates', frequency: 'Annual', status: 'Scheduled', headline: 'Births and fertility rate for 2025', indicatorId: 'fertility-rate' },
  { date: '2026-07-25', agency: 'Ministry of Health, Labour and Welfare', domain: 'society', title: 'Abridged Life Tables, 2025', frequency: 'Annual', status: 'Scheduled', headline: 'Life expectancy at birth for 2025', indicatorId: 'life-expectancy' },
  { date: '2026-10-02', agency: 'Ministry of Finance', domain: 'trade', title: 'Trade Statistics, September 2026', frequency: 'Monthly', status: 'Scheduled', headline: 'Merchandise exports and trade balance', indicatorId: 'exports' },
  { date: '2026-11-13', agency: 'National Institute of Population and Social Security Research', domain: 'society', title: 'Social Security Expenditure Statistics, FY2024', frequency: 'Annual', status: 'Scheduled', headline: 'Total benefits across pensions, health care and welfare', indicatorId: 'social-security' },
  { date: '2027-01-29', agency: 'Statistics Bureau of Japan', domain: 'labour', title: 'Labour Force Survey, December 2026', frequency: 'Monthly', status: 'Scheduled', headline: 'Employment and unemployment for 2026', indicatorId: 'employment-rate' },
];

export const OPEN_DATA_PACKS = [
  { id: 'macro-panel', title: 'Macro Panel 1995-2025', description: 'Headline economy, trade and society indicators as an annual panel.', coverage: '1995-2025, national, annual', records: 372, source: 'Cabinet Office; Ministry of Finance; NIPSSR', license: 'CC BY 4.0 · Public Reference' },
  { id: 'demographics-pack', title: 'Demographics Pack', description: 'Population, aging, fertility and median age series.', coverage: '1995-2025, national, annual', records: 124, source: 'Statistics Bureau of Japan; Ministry of Health, Labour and Welfare', license: 'CC BY 4.0 · Public Reference' },
  { id: 'prefectures-47', title: '47 Prefectures Snapshot', description: 'Six comparable regional metrics for every prefecture.', coverage: '2022-2024, 47 prefectures', records: 282, source: 'Cabinet Office; Statistics Bureau of Japan; Ministry of Health, Labour and Welfare', license: 'CC BY 4.0 · Public Reference' },
  { id: 'prices-wages', title: 'Prices and Wages', description: 'CPI, core inflation, wage index and derived yen purchasing power.', coverage: '1995-2025, national, annual', records: 155, source: 'Statistics Bureau of Japan; Ministry of Health, Labour and Welfare', license: 'CC BY 4.0 · Public Reference' },
];

export const METHODOLOGY_GLOSSARY = [
  { term: 'Nominal GDP', agency: 'Cabinet Office', summary: 'Value of final goods and services produced in Japan, measured at current prices without removing inflation.' },
  { term: 'Real GDP', agency: 'Cabinet Office', summary: 'GDP measured in chain-linked volume terms so that growth reflects output changes rather than price changes.' },
  { term: 'Unemployment Rate', agency: 'Statistics Bureau of Japan', summary: 'Persons without work who are available and seeking work, as a share of the labour force.' },
  { term: 'Core CPI', agency: 'Statistics Bureau of Japan', summary: 'Consumer price index excluding fresh food, the measure most watched for underlying inflation.' },
  { term: 'Total Fertility Rate', agency: 'Ministry of Health, Labour and Welfare', summary: 'Expected births per woman over her lifetime if current age-specific fertility rates persisted.' },
  { term: 'Aging Rate', agency: 'Statistics Bureau of Japan', summary: 'Share of the population aged 65 and over in the total population.' },
  { term: 'Cash Earnings', agency: 'Ministry of Health, Labour and Welfare', summary: 'Scheduled and overtime pay plus special payments per regular employee before tax.' },
  { term: 'Disposable Income', agency: 'Ministry of Internal Affairs and Communications', summary: 'Household income remaining after direct taxes and social insurance contributions.' },
  { term: 'Customs Clearance Basis', agency: 'Ministry of Finance', summary: 'Trade recorded when goods clear customs, used for official merchandise export and import totals.' },
  { term: 'Regional Price Index', agency: 'Statistics Bureau of Japan', summary: 'Prefectural price level relative to the national average set at 100, based on retail prices.' },
];