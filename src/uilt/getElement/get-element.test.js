import getElement from './index'

test('getElement test', () => {
    const div = document.createElement('div')
    const classbox = document.createElement('span')
    classbox.className = 'two'
    div.appendChild(classbox)
    const idbox = document.createElement('span')
    idbox.id = 'one'
    div.appendChild(idbox)

    expect(getElement(div,'#one')).toEqual([idbox])
    expect(getElement(div,'.two')).toEqual([classbox])
    expect(getElement(div,'span').length).toEqual(2)
});