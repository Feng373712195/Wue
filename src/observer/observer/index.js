const observer = (setdata,key,newval) => {
    console.log('observer');
    setdata[key] = newval;
}

export default observer