import { SanitizePipe } from './sanitize.pipe';
import { ArgumentMetadata } from '@nestjs/common';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;
  const bodyMeta: ArgumentMetadata = { type: 'body', metatype: Object, data: '' };
  const queryMeta: ArgumentMetadata = { type: 'query', metatype: Object, data: '' };

  beforeEach(() => {
    pipe = new SanitizePipe();
  });

  it('strips HTML tags from strings', () => {
    const result = pipe.transform({ name: '<b>hello</b>' }, bodyMeta);
    expect(result.name).toBe('hello');
  });

  it('strips script tags with content', () => {
    const result = pipe.transform(
      { text: 'safe<script>alert("xss")</script>text' },
      bodyMeta,
    );
    expect(result.text).toBe('safetext');
  });

  it('handles nested objects recursively', () => {
    const result = pipe.transform(
      { user: { name: '<i>test</i>', bio: '<p>hi</p>' } },
      bodyMeta,
    );
    expect(result.user.name).toBe('test');
    expect(result.user.bio).toBe('hi');
  });

  it('handles arrays', () => {
    const result = pipe.transform(
      { tags: ['<b>a</b>', '<script>x</script>b'] },
      bodyMeta,
    );
    expect(result.tags).toEqual(['a', 'b']);
  });

  it('decodes HTML entities', () => {
    const result = pipe.transform({ text: '&lt;div&gt;&amp;' }, bodyMeta);
    expect(result.text).toBe('<div>&');
  });

  it('trims whitespace', () => {
    const result = pipe.transform({ name: '  hello  ' }, bodyMeta);
    expect(result.name).toBe('hello');
  });

  it('ignores non-body metadata', () => {
    const input = { name: '<b>keep</b>' };
    const result = pipe.transform(input, queryMeta);
    expect(result).toBe(input);
  });

  it('passes through non-object values', () => {
    expect(pipe.transform('string', bodyMeta)).toBe('string');
    expect(pipe.transform(42, bodyMeta)).toBe(42);
    expect(pipe.transform(null, bodyMeta)).toBeNull();
  });

  it('preserves non-string fields', () => {
    const result = pipe.transform(
      { count: 5, active: true, name: '<b>x</b>' },
      bodyMeta,
    );
    expect(result.count).toBe(5);
    expect(result.active).toBe(true);
    expect(result.name).toBe('x');
  });
});
