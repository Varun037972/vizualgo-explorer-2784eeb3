import { TreeNode } from './TreeNode';

export class BinarySearchTree {
  root: TreeNode | null = null;

  insert(value: number | string): TreeNode {
    const newNode = new TreeNode(value);
    if (!this.root) {
      this.root = newNode;
      return newNode;
    }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          newNode.parent = current;
          return newNode;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          newNode.parent = current;
          return newNode;
        }
        current = current.right;
      }
    }
  }

  search(value: number | string): TreeNode | null {
    let current = this.root;
    while (current) {
      if (value === current.value) return current;
      current = value < current.value ? current.left : current.right;
    }
    return null;
  }

  delete(value: number | string): boolean {
    this.root = this.deleteNode(this.root, value);
    return true;
  }

  private deleteNode(node: TreeNode | null, value: number | string): TreeNode | null {
    if (!node) return null;

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value);
    } else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      const minRight = this.findMin(node.right);
      node.value = minRight.value;
      node.right = this.deleteNode(node.right, minRight.value);
    }
    return node;
  }

  private findMin(node: TreeNode): TreeNode {
    while (node.left) node = node.left;
    return node;
  }

  inorder(node: TreeNode | null = this.root, result: (number | string)[] = []): (number | string)[] {
    if (node) {
      this.inorder(node.left, result);
      result.push(node.value);
      this.inorder(node.right, result);
    }
    return result;
  }

  preorder(node: TreeNode | null = this.root, result: (number | string)[] = []): (number | string)[] {
    if (node) {
      result.push(node.value);
      this.preorder(node.left, result);
      this.preorder(node.right, result);
    }
    return result;
  }

  postorder(node: TreeNode | null = this.root, result: (number | string)[] = []): (number | string)[] {
    if (node) {
      this.postorder(node.left, result);
      this.postorder(node.right, result);
      result.push(node.value);
    }
    return result;
  }

  levelorder(): (number | string)[] {
    if (!this.root) return [];
    const result: (number | string)[] = [];
    const queue: TreeNode[] = [this.root];

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    return result;
  }
}
