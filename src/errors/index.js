/**
 * NoDFS custom errors
 */

class ExtendableError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
}

export class ConfigNotFoundError extends ExtendableError {}

export default {
  ConfigNotFoundError,
};
