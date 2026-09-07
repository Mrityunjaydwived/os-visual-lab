import type { ModuleConceptGuide } from './types';
import { MODULES_1_TO_6 } from './modules1to6';
import { MODULES_7_TO_12 } from './modules7to12';
import { MODULES_13_TO_18 } from './modules13to18';
import { MODULES_19_TO_24 } from './modules19to24';

export * from './types';

export const COMPLETE_STUDY_MATERIAL: Record<number, ModuleConceptGuide> = {
  ...MODULES_1_TO_6,
  ...MODULES_7_TO_12,
  ...MODULES_13_TO_18,
  ...MODULES_19_TO_24
};
