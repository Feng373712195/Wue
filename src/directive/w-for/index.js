const wfor = (vnode,propkey,data,wue) =>{
    
    if( !wue.init_render ){
        return vnode;
    }

    // w-for 嵌套 w-for // 暂时解决
    // w-for 中的 w-bind
    // w-for 中有 w-model 双向数据绑定  
    // w-for 数据变动 w-for不会重新渲染 // 目前可以
    
    const props = vnode.properties;
    const condition = props.attributes[propkey];
    const ret = parseWforAst(condition,data);

    const vnodes = [];
    const nestForVnode = [];

    let d = ret.data,
        v = ret.value,
        i = ret.index,
        k = ret.key;

    const isVnode = (n) => n.constructor === VNode;
    const isVtext = (n)=> n.constructor === VText;
    /* 深拷贝Vnode 切断关系 */
    const deepCloneVnode = (root)=>{ 
        isVnode(root) && ( root = Object.assign(new VNode(),root) ).children.length > 0 && ( root.children = [].concat(root.children.map(n=>{
        if(isVnode(n)) return deepCloneVnode( n );
        if(isVtext(n)) return Object.assign(new VText(),n);
        /*数组中如果是Vnode 也要拷贝*/ 
        if(isArray(n)) return [].concat( n.map( n=>deepCloneVnode(n) ) );
        })) );

        return root;
    
    }

    const forRenderHandler = (wue,node,fordata,data) =>{

    const blendData = Object.assign(data,fordata);
    const nestForHandler = [];
    node.children.map((childnode,index)=>{
            if( isVtext(childnode) && childnode.text.trim() ){
                childnode.text = findTmpText(childnode.text,blendData)
                return childnode;
            }
            /*是否嵌套for 的渲染操作*/
            if( isVnode(childnode) && !childnode.properties.attributes['w-for'] ){
                return forRenderHandler(wue,childnode,fordata,data);
            }else if( isVnode(childnode) && childnode.properties.attributes['w-for']  ){
                /** 嵌套循环if */
                let forVnodes = handleWueInDirective(wue,blendData,childnode);
                nestForHandler.push( () => { node.children.splice.apply(node.children,[index,1,...forVnodes]) });
            }else{
                return childnode;
            }
    })

    nestForHandler.map( h => { h(); h = null; return h } ).filter( v => v );

    return node;

    } 

    let forvnodes = [];

    if(isNumber(d)){
        for(let idx = 0; idx < d; idx++){

            let fordata = {};
            i && ( fordata[i] = undefined );
            k && ( fordata[k] = idx );
            v && ( fordata[v] = idx );

            let cloneVnode = deepCloneVnode(vnode);
            cloneVnode.properties.attributes['w-for'] = ret.expression;
            forvnodes.push( forRenderHandler(wue,cloneVnode,fordata,data)  );
        }
    }else{
        Object.keys(d).forEach((key,index)=>{

            let fordata = {};
            i && ( fordata[i] = index );
            k && ( fordata[k] = key );
            v && ( fordata[v] = d[key] );
    
            let cloneVnode = deepCloneVnode(vnode);
            cloneVnode.properties.attributes['w-for'] = ret.expression;
            forvnodes.push( forRenderHandler(wue,cloneVnode,fordata,data)  );
        })
    }

    return forvnodes; 
}