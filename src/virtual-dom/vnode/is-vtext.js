module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText"
}
