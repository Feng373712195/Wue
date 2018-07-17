const isEmptyObject = (obj) => {
    for(let x in obj) return false;
    return true;
}

export default isEmptyObject


