// Which data layer the app runs on (IMPLEMENTATION_PLAN Part A / INT-1): `mock` (fixtures + mock
// repositories, the default in Part A) or `api` (HTTP repositories behind the same interfaces).
// Set with VITE_DATA_SOURCE=mock|api. Components never read this; repositories and demo tools do.
export type DataSource = 'mock' | 'api';

export const DATA_SOURCE: DataSource = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'mock';
export const isMockData = DATA_SOURCE === 'mock';
