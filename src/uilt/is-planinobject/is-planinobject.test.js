import isPlainObject from './index';

test('test isPlainObject',()=>{
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(false)).toBe(false);
    expect(isPlainObject(()=>{})).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(NaN)).toBe(false);
    expect(isPlainObject(1)).toBe(false);
    expect(isPlainObject('1')).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject({})).toBe(true);
})