const applyProperties = require('./apply-properties');

const VPatch = require('../vnode/vpatch.js');

module.exports = applyPatch;

function applyPatch(vpatch, domNode, renderOptions) {
  const { type } = vpatch;
  const { vNode } = vpatch;
  const { patch } = vpatch;

  switch (type) {
    case VPatch.REMOVE:
      return removeNode(domNode, vNode);
    case VPatch.INSERT:
      return insertNode(domNode, patch, renderOptions);
    case VPatch.VTEXT:
      return stringPatch(domNode, vNode, patch, renderOptions);
    case VPatch.VNODE:
      return vNodePatch(domNode, vNode, patch, renderOptions);
    case VPatch.ORDER:
      reorderChildren(domNode, patch);
      return domNode;
    case VPatch.PROPS:
      applyProperties(domNode, patch, vNode.properties);
      return domNode;
    default:
      return domNode;
  }
}

function removeNode(domNode, vNode) {
  console.log('removeNode');

  const { parentNode } = domNode;
  if (parentNode) {
    parentNode.removeChild(domNode);
  }

  return null;
}

function insertNode(parentNode, vNode, renderOptions) {
  const newNode = renderOptions.render(vNode, renderOptions);

  if (parentNode) {
    parentNode.appendChild(newNode);
  }

  return parentNode;
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
  let newNode;

  if (domNode.nodeType === 3) {
    domNode.replaceData(0, domNode.length, vText.text);
    newNode = domNode;
  } else {
    console.log(2);

    const { parentNode } = domNode;
    newNode = renderOptions.render(vText, renderOptions);

    if (parentNode && newNode !== domNode) {
      parentNode.replaceChild(newNode, domNode);
    }
  }

  leftVNode.destroy && leftVNode.destroy.bind(null, domNode)();

  return newNode;
}


function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
  const { parentNode } = domNode;
  const newNode = renderOptions.render(vNode, renderOptions);

  if (parentNode && newNode !== domNode) {
    parentNode.replaceChild(newNode, domNode);
  }

  return newNode;
}

function reorderChildren(domNode, moves) {
  const { childNodes } = domNode;
  const keyMap = {};
  let node;
  let remove;
  let insert;

  for (let i = 0; i < moves.removes.length; i++) {
    remove = moves.removes[i];
    node = childNodes[remove.from];
    if (remove.key) {
      keyMap[remove.key] = node;
    }
    domNode.removeChild(node);
  }

  let { length } = childNodes;
  for (let j = 0; j < moves.inserts.length; j++) {
    insert = moves.inserts[j];
    node = keyMap[insert.key];
    // this is the weirdest bug i've ever seen in webkit
    domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
  }
}

function replaceRoot(oldRoot, newRoot) {
  if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
    oldRoot.parentNode.replaceChild(newRoot, oldRoot);
  }

  return newRoot;
}
