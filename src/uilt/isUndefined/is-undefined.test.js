import isUndefined from './index';

test('test isUndefined',()=>{
    expect(isUndefined(true)).toBe(false);
    expect(isUndefined(false)).toBe(false);
    expect(isUndefined(()=>{})).toBe(false);
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);
    expect(isUndefined(NaN)).toBe(false);
    expect(isUndefined(1)).toBe(false);
    expect(isUndefined('1')).toBe(false);
    expect(isUndefined([])).toBe(false);
    expect(isUndefined({})).toBe(false);
})