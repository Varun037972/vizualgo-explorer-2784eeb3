import { TreeNode } from './TreeNode';
import { BinarySearchTree } from './BinarySearchTree';

export class RedBlackTree extends BinarySearchTree {
  insert(value: number | string): TreeNode {
    const newNode = super.insert(value);
    newNode.color = 'red';
    this.fixInsert(newNode);
    return newNode;
  }

  private fixInsert(node: TreeNode): void {
    while (node.parent && node.parent.color === 'red') {
      if (node.parent === node.parent.parent?.left) {
        const uncle = node.parent.parent.right;
        if (uncle?.color === 'red') {
          node.parent.color = 'black';
          uncle.color = 'black';
          node.parent.parent.color = 'red';
          node = node.parent.parent;
        } else {
          if (node === node.parent.right) {
            node = node.parent;
            this.rotateLeft(node);
          }
          node.parent!.color = 'black';
          node.parent!.parent!.color = 'red';
          this.rotateRight(node.parent!.parent!);
        }
      } else {
        const uncle = node.parent.parent?.left;
        if (uncle?.color === 'red') {
          node.parent.color = 'black';
          uncle.color = 'black';
          node.parent.parent!.color = 'red';
          node = node.parent.parent!;
        } else {
          if (node === node.parent.left) {
            node = node.parent;
            this.rotateRight(node);
          }
          node.parent!.color = 'black';
          node.parent!.parent!.color = 'red';
          this.rotateLeft(node.parent!.parent!);
        }
      }
    }
    if (this.root) this.root.color = 'black';
  }

  private rotateLeft(node: TreeNode): void {
    const right = node.right!;
    node.right = right.left;
    if (right.left) right.left.parent = node;
    right.parent = node.parent;
    
    if (!node.parent) {
      this.root = right;
    } else if (node === node.parent.left) {
      node.parent.left = right;
    } else {
      node.parent.right = right;
    }
    
    right.left = node;
    node.parent = right;
  }

  private rotateRight(node: TreeNode): void {
    const left = node.left!;
    node.left = left.right;
    if (left.right) left.right.parent = node;
    left.parent = node.parent;
    
    if (!node.parent) {
      this.root = left;
    } else if (node === node.parent.right) {
      node.parent.right = left;
    } else {
      node.parent.left = left;
    }
    
    left.right = node;
    node.parent = left;
  }
}
