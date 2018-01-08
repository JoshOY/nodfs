/**
 * NOHDFS iNode definition
 */

class INode {
  constructor(options = {}) {
    this.name = options.name || '';
    this.parent_dir = options.parent_dir || null;
    this.mod_t = options.mod_t || null;
  }
}

class INodeFile extends INode {
}

class INodeDirectory extends INode {
}