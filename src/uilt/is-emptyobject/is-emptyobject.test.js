import isEmptyObject from './index';

test('isEmptyObject test', () => {
    expect(isEmptyObject({})).toBe(true);
    expect(isEmptyObject({num:1})).toBe(false);
});