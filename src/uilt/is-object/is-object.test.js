import isObject from './index';

test('test isObject',()=>{
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
    expect(isObject(()=>{})).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(NaN)).toBe(false);
    expect(isObject(1)).toBe(false);
    expect(isObject('1')).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject({})).toBe(true);
})