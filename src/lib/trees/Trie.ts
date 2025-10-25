import { TrieNode } from './TreeNode';

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode('');
  }

  insert(word: string): void {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode(char));
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  search(word: string): boolean {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) return false;
      current = current.children.get(char)!;
    }
    return current.isEndOfWord;
  }

  delete(word: string): boolean {
    return this.deleteHelper(this.root, word.toLowerCase(), 0);
  }

  private deleteHelper(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) return false;
      node.isEndOfWord = false;
      return node.children.size === 0;
    }

    const char = word[index];
    const childNode = node.children.get(char);
    if (!childNode) return false;

    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      return node.children.size === 0 && !node.isEndOfWord;
    }

    return false;
  }

  getAllWords(): string[] {
    const words: string[] = [];
    this.collectWords(this.root, '', words);
    return words;
  }

  private collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEndOfWord) {
      words.push(prefix);
    }
    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, prefix + char, words);
    }
  }
}
