module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode"
}
