import isNull from './index';

test('test isNull',()=>{
    expect(isNull(true)).toBe(false);
    expect(isNull(false)).toBe(false);
    expect(isNull(()=>{})).toBe(false);
    expect(isNull(undefined)).toBe(false);
    expect(isNull(null)).toBe(true);
    expect(isNull(NaN)).toBe(false);
    expect(isNull(1)).toBe(false);
    expect(isNull('1')).toBe(false);
    expect(isNull([])).toBe(false);
    expect(isNull({})).toBe(false);
})