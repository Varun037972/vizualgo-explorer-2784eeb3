export class TreeNode {
  value: number | string;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  parent: TreeNode | null = null;
  height: number = 1;
  color: 'red' | 'black' = 'red'; // For Red-Black trees
  id: string;

  constructor(value: number | string) {
    this.value = value;
    this.id = `node-${value}-${Date.now()}-${Math.random()}`;
  }
}

export class BTreeNode {
  keys: number[] = [];
  children: BTreeNode[] = [];
  isLeaf: boolean = true;
  id: string;

  constructor() {
    this.id = `btree-${Date.now()}-${Math.random()}`;
  }
}

export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  char: string;
  id: string;

  constructor(char: string = '') {
    this.char = char;
    this.id = `trie-${char}-${Date.now()}-${Math.random()}`;
  }
}
