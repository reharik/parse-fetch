/**
 * Barrel file for all parsing strategies
 */

import { additionalStrategy } from './additionalStrategy';
import { binaryStrategy } from './binaryStrategy';
import { jsonStrategy } from './jsonStrategy';
import { textStrategy } from './textStrategy';
import { xmlStrategy } from './xmlStrategy';

export const strategies = [
  additionalStrategy,
  binaryStrategy,
  jsonStrategy,
  textStrategy,
  xmlStrategy,
];
