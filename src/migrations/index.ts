import * as migration_20260825_172237_initial from './20260825_172237_initial';

export const migrations = [
  {
    up: migration_20260825_172237_initial.up,
    down: migration_20260825_172237_initial.down,
    name: '20260825_172237_initial'
  },
];
