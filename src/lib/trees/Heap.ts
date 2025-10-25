export class Heap {
  private heap: number[] = [];
  private isMaxHeap: boolean;

  constructor(isMaxHeap: boolean = true) {
    this.isMaxHeap = isMaxHeap;
  }

  insert(value: number): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  delete(): number | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return root;
  }

  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.shouldSwap(this.heap[parentIndex], this.heap[index])) {
        [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private heapifyDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let targetIndex = index;

      if (leftChild < this.heap.length && this.shouldSwap(this.heap[targetIndex], this.heap[leftChild])) {
        targetIndex = leftChild;
      }
      if (rightChild < this.heap.length && this.shouldSwap(this.heap[targetIndex], this.heap[rightChild])) {
        targetIndex = rightChild;
      }

      if (targetIndex !== index) {
        [this.heap[index], this.heap[targetIndex]] = [this.heap[targetIndex], this.heap[index]];
        index = targetIndex;
      } else {
        break;
      }
    }
  }

  private shouldSwap(parent: number, child: number): boolean {
    return this.isMaxHeap ? parent < child : parent > child;
  }

  getArray(): number[] {
    return [...this.heap];
  }

  clear(): void {
    this.heap = [];
  }
}
