const AppError = require('../src/shared/errors/AppError');
const parseId = require('../src/shared/utils/parseId');

describe('parseId', () => {
  test('parses valid integer string', () => {
    expect(parseId('1')).toBe(1);
    expect(parseId('999')).toBe(999);
  });

  test('parses valid number', () => {
    expect(parseId(5)).toBe(5);
  });

  test('rejects NaN', () => {
    expect(() => parseId('abc')).toThrow(AppError);
    expect(() => parseId('abc')).toThrow('Invalid ID parameter');
  });

  test('rejects float', () => {
    expect(() => parseId('1.5')).toThrow('Invalid ID parameter');
  });

  test('rejects zero', () => {
    expect(() => parseId('0')).toThrow('Invalid ID parameter');
  });

  test('rejects negative', () => {
    expect(() => parseId('-1')).toThrow('Invalid ID parameter');
  });

  test('rejects Infinity', () => {
    expect(() => parseId('Infinity')).toThrow('Invalid ID parameter');
  });

  test('rejects empty string', () => {
    expect(() => parseId('')).toThrow('Invalid ID parameter');
  });
});
