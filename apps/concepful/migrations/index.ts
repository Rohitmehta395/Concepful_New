import * as migration_20260830_152311 from './20260830_152311';
import * as migration_20260903_120000 from './20260903_120000';

export const migrations = [
  {
    up: migration_20260830_152311.up,
    down: migration_20260830_152311.down,
    name: '20260830_152311'
  },
  {
    up: migration_20260903_120000.up,
    down: migration_20260903_120000.down,
    name: '20260903_120000'
  },
];
