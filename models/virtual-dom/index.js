var diff = require('./diff/diff')
var create = require('./vdom/create-element')
var patch = require('./vdom/patch') 
var VNode = require('./vnode/vnode')
var VText = require('./vnode/vtext')
var isVText = require('./vnode/is-vtext')
var isVNode = require('./vnode/is-vnode')

module.exports = {
    diff,
    patch,
    create,
    VNode,
    VText,
    isVText,
    isVNode
}