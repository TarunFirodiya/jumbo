
interface Segmenter {
  segment(input: string): IterableIterator<{ segment: string }>;
}

interface SegmenterConstructor {
  new(locale: string, options?: { granularity: string }): Segmenter;
}

declare namespace Intl {
  var Segmenter: SegmenterConstructor;
}
