import { ChakConfig, ChakRow } from '../types';

export const CHAK_CONFIGS: ChakConfig[] = [
  {
    name: 'ناڑی چک',
    data: [
      [18, 10], [17, 10], [16, 10], [15, 10], [14, 10], [13, 10],
      [12, 10], [11, 10], [10, 10], [9, 20], [8, 20], [7, 20],
      [6, 20], [5, 20]
    ]
  },
  {
    name: 'کانا چک',
    data: [
      [18, 10], [17, 10], [16, 12], [15, 12], [14, 15], [13, 20],
      [12, 25], [11, 25], [10, 25], [9, 25], [8, 25], [7, 25],
      [6, 25], [5, 25]
    ]
  },
  {
    name: 'پشاوری چک',
    data: [
      [18, 20], [17, 20], [16, 20], [15, 20], [14, 20], [13, 20],
      [12, 20], [11, 20], [10, 20], [9, 20], [8, 20], [7, 20],
      [6, 20], [5, 20]
    ]
  },
  {
    name: 'لکی مروت چک',
    data: [
      [18, 10], [17, 10], [16, 12], [15, 12], [14, 15], [13, 20],
      [12, 25], [11, 25], [10, 25], [9, 25], [8, 25], [7, 25],
      [6, 25], [5, 25]
    ]
  }
];

export function generateInitialRows(configIndex: number): ChakRow[] {
  const conf = CHAK_CONFIGS[configIndex] || CHAK_CONFIGS[0];
  return conf.data.map(([size, cutting], i) => ({
    id: `row-${configIndex}-${i}-${size}-${cutting}`,
    size,
    cutting,
    qty: '',
    rowTotal: 0,
    hundred: 0
  }));
}
