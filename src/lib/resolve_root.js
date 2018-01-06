import path from 'path';

export default function resolve_root(fn) {
  return path.resolve(__dirname, '../..', fn);
}
