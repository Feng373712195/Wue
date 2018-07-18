import isFunction from './index';

test('isDom test', () => {
    expect(isFunction(true)).toBe(false);
    expect(isFunction(false)).toBe(false);
    expect(isFunction(()=>{})).toBe(true);
    expect(isFunction(undefined)).toBe(false);
    expect(isFunction(null)).toBe(true);
    expect(isFunction(NaN)).toBe(false);
    expect(isFunction(1)).toBe(false);
    expect(isFunction('1')).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction({})).toBe(false);
});