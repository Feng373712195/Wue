var isVNode = require("./is-vnode")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0

    for (var i = 0; i < count; i++) {  
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0
        }
    }

    this.count = count + descendants
}

VirtualNode.prototype.type = "VirtualNode"
