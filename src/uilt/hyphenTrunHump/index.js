const HyphenTrunHump = (str) => {
    return  str
    .split('-')
    .map( (v,i)=> { return i > 0 ? `${v[0].toUpperCase()}${v.substring(1, v.length)}` : v } )
    .join('')
 }

 export default HyphenTrunHump