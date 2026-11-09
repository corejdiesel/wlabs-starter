import * as migration_20260825_172237_initial from './20260825_172237_initial';
import * as migration_20261109_151034_upgrade_payload_3_93 from './20261109_151034_upgrade_payload_3_93';

export const migrations = [
  {
    up: migration_20260825_172237_initial.up,
    down: migration_20260825_172237_initial.down,
    name: '20260825_172237_initial',
  },
  {
    up: migration_20261109_151034_upgrade_payload_3_93.up,
    down: migration_20261109_151034_upgrade_payload_3_93.down,
    name: '20261109_151034_upgrade_payload_3_93'
  },
];
