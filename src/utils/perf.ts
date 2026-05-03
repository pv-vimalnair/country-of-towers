export const perf = {
  marks: {} as Record<string, number>,
  start(name: string) {
    this.marks[name] = Date.now();
  },
  end(name: string) {
    if (this.marks[name]) {
      const elapsed = Date.now() - this.marks[name];
      if (elapsed > 100) console.warn(`[PERF] ${name}: ${elapsed}ms`);
      delete this.marks[name];
    }
  },
};
