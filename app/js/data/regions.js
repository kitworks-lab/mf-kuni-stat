export const REGION_NAMES = ['Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kinki', 'Chugoku', 'Shikoku', 'Kyushu'];

export const REGIONAL_METRICS = [
  { key: 'agingPct', label: '65+ Aging Rate', shortLabel: 'Aging', unit: '%', digits: 1, source: 'Statistics Bureau of Japan, Population Estimates', year: 2024 },
  { key: 'grpPerCapita', label: 'GRP per Capita', shortLabel: 'GRP/cap', unit: '¥k', digits: 0, source: 'Cabinet Office, Prefectural Accounts', year: 2022 },
  { key: 'popK', label: 'Population', shortLabel: 'Pop.', unit: 'k', digits: 0, source: 'Statistics Bureau of Japan, Population Estimates', year: 2024 },
  { key: 'monthlyWageK', label: 'Monthly Earnings', shortLabel: 'Wage', unit: '¥k', digits: 0, source: 'Ministry of Health, Labour and Welfare, Basic Survey on Wage Structure', year: 2024 },
  { key: 'unemployment', label: 'Unemployment Rate', shortLabel: 'Unemp.', unit: '%', digits: 1, source: 'Statistics Bureau of Japan, Labour Force Survey', year: 2024 },
  { key: 'costIndex', label: 'Regional Price Index', shortLabel: 'Prices', unit: 'JP=100', digits: 1, source: 'Statistics Bureau of Japan, Retail Price Survey', year: 2024 },
];

export const NATIONAL_BENCHMARK = {
  popK: 123800,
  agingPct: 29.3,
  grpPerCapita: 4750,
  monthlyWageK: 330,
  unemployment: 2.5,
  costIndex: 100,
};

const ROWS = [
  ['HKD', 'Hokkaido', 'Hokkaido', 5043, 33.2, 4080, 301, 2.7, 99.4, -9.6, 'Largest prefecture by area; tourism and agriculture hub'],
  ['AOM', 'Aomori', 'Tohoku', 1176, 36.6, 3560, 277, 3.0, 97.8, -7.5, 'Among the lowest life expectancies; apple production'],
  ['AKT', 'Akita', 'Tohoku', 897, 39.5, 3890, 282, 2.3, 96.4, -7.2, 'Highest aging rate in Japan'],
  ['IWT', 'Iwate', 'Tohoku', 1163, 35.6, 3920, 280, 2.4, 97.2, -6.4, 'Second-largest prefecture by area'],
  ['YGT', 'Yamagata', 'Tohoku', 1033, 35.4, 3830, 288, 2.1, 97.0, -4.9, 'Fruit growing and precision manufacturing'],
  ['MYG', 'Miyagi', 'Tohoku', 2265, 29.6, 4380, 314, 2.6, 99.0, -1.2, 'Tohoku regional hub centered on Sendai'],
  ['NGT', 'Niigata', 'Chubu', 2132, 34.4, 3930, 297, 2.3, 97.5, -9.0, 'Major rice-producing prefecture'],
  ['TCG', 'Tochigi', 'Kanto', 1897, 30.8, 5060, 322, 2.4, 97.6, -2.5, 'Manufacturing and strong export base'],
  ['FKS', 'Fukushima', 'Tohoku', 1767, 34.1, 4140, 295, 2.3, 97.1, -7.9, 'Recovery and renewable energy investment'],
  ['TYM', 'Toyama', 'Chubu', 1017, 33.6, 4600, 313, 2.0, 97.3, -2.6, 'High household income and manufacturing output'],
  ['GNM', 'Gunma', 'Kanto', 1900, 31.6, 4580, 314, 2.3, 97.4, -3.2, 'Automotive and precision industries'],
  ['SIT', 'Saitama', 'Kanto', 7337, 28.0, 3660, 335, 2.5, 100.6, 28.3, 'Commuter belt for Tokyo'],
  ['IBR', 'Ibaraki', 'Kanto', 2807, 30.9, 4560, 325, 2.6, 98.0, -3.1, 'Science city Tsukuba and industrial coast'],
  ['ISK', 'Ishikawa', 'Chubu', 1109, 30.9, 4260, 309, 2.1, 98.2, -2.3, 'Recovering from 2024 Noto earthquake'],
  ['FKI', 'Fukui', 'Chubu', 750, 32.7, 4580, 306, 1.9, 97.6, -2.2, 'Highest share of dual-income households'],
  ['GIF', 'Gifu', 'Chubu', 1936, 31.8, 3960, 311, 2.1, 97.4, -4.8, 'Machinery and aerospace parts'],
  ['NGN', 'Nagano', 'Chubu', 2007, 33.1, 4050, 302, 2.0, 97.8, -3.0, 'Highlands tourism and precision instruments'],
  ['YMN', 'Yamanashi', 'Chubu', 797, 32.5, 3970, 303, 2.2, 97.9, -1.8, 'Fruit and mineral water producer near Mt. Fuji'],
  ['TKY', 'Tokyo', 'Kanto', 14178, 22.8, 8350, 418, 2.4, 105.4, 68.2, 'Largest economy and population concentration'],
  ['CHB', 'Chiba', 'Kanto', 6266, 28.7, 3770, 336, 2.5, 100.4, 9.6, 'Gateway airport and petrochemical coast'],
  ['SHG', 'Shiga', 'Kinki', 1400, 27.4, 4980, 328, 2.0, 98.5, 0.4, 'Rare growth prefecture in western Japan'],
  ['AIC', 'Aichi', 'Chubu', 7460, 25.5, 5560, 364, 2.2, 100.3, 8.3, 'Automotive manufacturing capital'],
  ['SZO', 'Shizuoka', 'Chubu', 3600, 31.2, 4690, 322, 2.3, 99.2, -10.3, 'Tea, motorcycles and musical instruments'],
  ['KNG', 'Kanagawa', 'Kanto', 9230, 26.2, 4140, 355, 2.6, 103.2, 36.5, 'Second-largest population; Yokohama port'],
  ['SMN', 'Shimane', 'Chugoku', 646, 36.3, 3770, 289, 1.9, 97.6, -2.4, 'Least populous of Honshu prefectures'],
  ['TTR', 'Tottori', 'Chugoku', 531, 33.9, 3490, 280, 2.0, 96.9, -1.7, 'Least populous prefecture in Japan'],
  ['HYG', 'Hyogo', 'Kinki', 5365, 30.2, 4160, 333, 2.8, 100.0, -8.6, 'Kobe port and heavy industry'],
  ['KYT', 'Kyoto', 'Kinki', 2490, 30.1, 4220, 330, 2.7, 99.5, -3.6, 'Cultural capital with high tourism inflow'],
  ['NAR', 'Nara', 'Kinki', 1290, 32.2, 3310, 308, 2.5, 98.4, -4.9, 'Heritage tourism and Osaka commuter base'],
  ['MIE', 'Mie', 'Chubu', 1740, 31.4, 4390, 314, 2.2, 98.0, -3.6, 'Semiconductor and petrochemical cluster'],
  ['YGC', 'Yamaguchi', 'Chugoku', 1298, 35.2, 4680, 305, 2.4, 97.4, -4.9, 'Chemical industry along the Seto Inland Sea'],
  ['HRS', 'Hiroshima', 'Chugoku', 2760, 29.9, 4310, 322, 2.5, 98.9, -2.6, 'Automaker and shipbuilding center'],
  ['OKY', 'Okayama', 'Chugoku', 1862, 30.8, 3880, 309, 2.3, 98.2, -3.5, 'Mizushima industrial complex'],
  ['OSK', 'Osaka', 'Kinki', 8775, 27.6, 4780, 358, 2.9, 100.8, 8.4, 'Kansai commercial center'],
  ['WKY', 'Wakayama', 'Kinki', 890, 34.7, 3950, 296, 2.9, 96.8, -6.1, 'Citrus orchards and pilgrimage routes'],
  ['FUK', 'Fukuoka', 'Kyushu', 5092, 28.1, 4020, 315, 2.8, 98.6, 11.2, 'Fastest-growing hub in western Japan'],
  ['SAG', 'Saga', 'Kyushu', 801, 31.3, 3590, 294, 2.3, 96.9, -1.3, 'Ceramics and semiconductor supply chain'],
  ['NGS', 'Nagasaki', 'Kyushu', 1272, 34.2, 3290, 282, 2.8, 97.0, -6.9, 'Shipbuilding and island economy'],
  ['EHM', 'Ehime', 'Shikoku', 1297, 34.2, 3710, 295, 2.4, 97.1, -5.4, 'Citrus and paper manufacturing'],
  ['KGW', 'Kagawa', 'Shikoku', 928, 32.7, 3880, 304, 2.2, 97.4, -1.9, 'Smallest prefecture by area'],
  ['TKS', 'Tokushima', 'Shikoku', 685, 35.3, 4350, 291, 2.3, 97.0, -3.5, 'LED and pharmaceutical industry'],
  ['KMM', 'Kumamoto', 'Kyushu', 1718, 31.7, 3600, 296, 2.8, 97.6, -1.7, 'Semiconductor investment surge'],
  ['OIT', 'Oita', 'Kyushu', 1087, 34.0, 3860, 297, 2.5, 97.3, -2.6, 'Hot spring tourism and steel'],
  ['KOC', 'Kochi', 'Shikoku', 658, 36.1, 3260, 283, 2.7, 96.8, -4.5, 'Lowest population density in Shikoku'],
  ['MYZ', 'Miyazaki', 'Kyushu', 1052, 33.9, 3180, 280, 2.9, 96.5, -3.7, 'Livestock and agriculture'],
  ['KGS', 'Kagoshima', 'Kyushu', 1537, 33.2, 3330, 283, 2.7, 96.9, -6.0, 'Southern Kyushu agriculture and space launch site'],
  ['OKN', 'Okinawa', 'Kyushu', 1468, 24.3, 3140, 268, 3.1, 99.1, -0.4, 'Youngest age profile and highest fertility'],
];

export const PREFECTURES = ROWS.map(
  ([code, name, region, popK, agingPct, grpPerCapita, monthlyWageK, unemployment, costIndex, netMigration, highlight]) => ({
    code, name, region, popK, agingPct, grpPerCapita, monthlyWageK, unemployment, costIndex, netMigration, highlight,
  }),
);

export function getPrefectureByCode(code) {
  return PREFECTURES.find((prefecture) => prefecture.code === code) ?? null;
}