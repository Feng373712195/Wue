import isString from './index';

test('test isString',()=>{
    expect(isString(true)).toBe(false);
    expect(isString(false)).toBe(false);
    expect(isString(()=>{})).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(NaN)).toBe(false);
    expect(isString(1)).toBe(false);
    expect(isString('1')).toBe(true);
    expect(isString([])).toBe(false);
    expect(isString({})).toBe(false);
})