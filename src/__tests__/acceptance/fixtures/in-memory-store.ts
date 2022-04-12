import {Options, Store} from 'express-rate-limit';

const calculateNextResetTime = (windowMs: number): Date => {
  const resetTime = new Date();
  resetTime.setMilliseconds(resetTime.getMilliseconds() + windowMs);
  return resetTime;
};

export class InMemoryStore implements Store {
  windowMs!: number;
  hits: {
    [key: string]: number | undefined;
  };
  resetTime: Date;

  constructor(options?: Options) {
    this.hits = {};
    this.windowMs = options?.windowMs ?? 60000;
    // Then calculate the reset time using that
    this.resetTime = calculateNextResetTime(this.windowMs);
  }
  increment(key: string) {
    const totalHits = (this.hits[key] ?? 0) + 1;
    this.hits[key] = totalHits;
    return {
      totalHits,
      resetTime: this.resetTime,
    };
  }
  decrement(key: string) {
    const current = this.hits[key];
    if (current) {
      this.hits[key] = current - 1;
    }
  }
  resetKey(key: string) {
    delete this.hits[key];
  }
  resetAll() {
    this.hits = {};
    this.resetTime = calculateNextResetTime(this.windowMs);
  }

  setInterval(windowMs: number) {
    this.windowMs = windowMs;
    const interval = setInterval(() => {
      this.resetAll();
    }, this.windowMs);
    if (interval.unref) {
      interval.unref();
    }
  }
}
