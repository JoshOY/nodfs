/**
 * Utility function to resolve project root path
 */

import path from 'path';

export default function prjRoot(fn) {
  return path.resolve(__dirname, '../..', fn);
}
