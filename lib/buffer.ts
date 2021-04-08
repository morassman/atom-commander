export class Buffer {

  size: number
  array: any[]

  constructor(public readonly maxSize: number | null) {
    this.size = 0
    this.array = []
  }

  push(data: any) {
    this.size += data.length
    this.array.push(data)

    if (this.maxSize === null) {
      return
    }

    while (this.size > this.maxSize) {
      const diff = this.size - this.maxSize

      if (diff < this.array[0].length) {
        this.array[0] = this.array[0].slice(diff)
        this.size -= diff
      } else {
        const discard = this.array.shift()
        this.size -= discard.length
      }
    }
  }

  clear() {
    this.size = 0
    return this.array = []
  }

  getLineCount(): number {
    return this.array.length
  }

  toString(): string {
    return this.array.join('')
  }

}
