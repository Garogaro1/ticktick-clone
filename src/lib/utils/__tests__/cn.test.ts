import { cn } from '../cn';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'active', false && 'inactive')).toBe('base-class active');
  });

  it('should handle undefined and null values', () => {
    expect(cn('px-4', undefined, null, 'py-2')).toBe('px-4 py-2');
  });

  it('should handle empty strings', () => {
    expect(cn('px-4', '', 'py-2')).toBe('px-4 py-2');
  });

  it('should return empty string when no classes provided', () => {
    expect(cn()).toBe('');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['px-4', 'py-2'], 'text-white')).toBe('px-4 py-2 text-white');
  });

  it('should handle objects with boolean values', () => {
    expect(cn({ 'px-4': true, 'py-2': false, 'text-white': true })).toBe('px-4 text-white');
  });
});
