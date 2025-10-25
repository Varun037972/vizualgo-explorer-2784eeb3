import { TreeNode } from './TreeNode';
import { BinarySearchTree } from './BinarySearchTree';

export class AVLTree extends BinarySearchTree {
  insert(value: number | string): TreeNode {
    this.root = this.insertNode(this.root, value);
    return this.search(value)!;
  }

  private insertNode(node: TreeNode | null, value: number | string): TreeNode {
    if (!node) return new TreeNode(value);

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
      if (node.left) node.left.parent = node;
    } else {
      node.right = this.insertNode(node.right, value);
      if (node.right) node.right.parent = node;
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    const balance = this.getBalance(node);

    // Left Left
    if (balance > 1 && node.left && value < node.left.value) {
      return this.rotateRight(node);
    }
    // Right Right
    if (balance < -1 && node.right && value > node.right.value) {
      return this.rotateLeft(node);
    }
    // Left Right
    if (balance > 1 && node.left && value > node.left.value) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }
    // Right Left
    if (balance < -1 && node.right && value < node.right.value) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  private getHeight(node: TreeNode | null): number {
    return node ? node.height : 0;
  }

  private getBalance(node: TreeNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  private rotateRight(y: TreeNode): TreeNode {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    x.parent = y.parent;
    y.parent = x;
    if (T2) T2.parent = y;

    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));

    return x;
  }

  private rotateLeft(x: TreeNode): TreeNode {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    y.parent = x.parent;
    x.parent = y;
    if (T2) T2.parent = x;

    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));

    return y;
  }
}
