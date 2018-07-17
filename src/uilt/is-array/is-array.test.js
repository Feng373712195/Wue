import isArray from './index';

test('test isArray',()=>{
    expect(isArray(true)).toBe(false);
    expect(isArray(false)).toBe(false);
    expect(isArray(()=>{})).toBe(false);
    expect(isArray(undefined)).toBe(false);
    expect(isArray(null)).toBe(false);
    expect(isArray(NaN)).toBe(false);
    expect(isArray(1)).toBe(false);
    expect(isArray('1')).toBe(false);
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
})