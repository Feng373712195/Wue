import isDom from './index';

test('isDom test', () => {
    const div = document.createElement('div');
    expect(isDom(div)).toBe(true);
});