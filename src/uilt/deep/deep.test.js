import deep from './index'

test('deep test', () => {
    const o = { x:{ num:1 },y:[1,2,3] };
    
    expect(deep(o)).not.toBe(o)
    expect(deep(o).x).not.toBe(o.x)
    expect(deep(o).y).not.toBe(o.y)
})