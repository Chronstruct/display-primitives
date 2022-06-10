'use strict'
var t = require('@babel/types')
var Utils = require('./utils')
var renameTag = Utils.renameTag,
  BASE_PROPS_TO_OMIT = Utils.BASE_PROPS_TO_OMIT,
  buildClassNamePropFunction = Utils.buildClassNamePropFunction
// var printAST = require('ast-pretty-print')

/**
 * @param {JSXElement} node
 * @param {string} nodeName
 * @param {string} defaultTag
 */
function transform(node, nodeName, defaultTag) {
  function buildProps(node) {
    var props = []
    let otherClassNames

    if (node.openingElement.attributes != null) {
      node.openingElement.attributes.forEach((attribute) => {
        // Forward the prop spread on
        if (t.isJSXSpreadAttribute(attribute)) {
          props.push(attribute)
          return
        }

        var name = attribute.name.name

        if (name in BASE_PROPS_TO_OMIT) {
          return
        } else if (name === 'className') {
          if (t.isJSXExpressionContainer(attribute.value)) {
            otherClassNames = attribute.value.expression
          } else if (t.isStringLiteral(attribute.value)) {
            otherClassNames = attribute.value
          }
        } else {
          props.push(attribute)
        }
      })
    }

    var classNameProp = buildClassNamePropFunction(t, nodeName, otherClassNames)
    classNameProp.value.expression.loc = node.loc
    props.push(classNameProp)

    return props
  }

  renameTag(node, defaultTag)
  node.openingElement.attributes = buildProps(node)
}

module.exports = function (babel) {
  var { types: t } = babel

  return {
    // ---
    // below equates to `inherits: @babel/plugin-syntax-jsx;`
    // https://github.com/babel/babel/blob/master/packages/babel-plugin-syntax-jsx/src/index.js#L9
    //
    manipulateOptions(opts, parserOpts) {
      // If the Typescript plugin already ran, it will have decided whether
      // or not this is a TSX file.
      if (
        parserOpts.plugins.some(
          (p) => (Array.isArray(p) ? p[0] : p) === 'typescript',
        )
      ) {
        return
      }

      parserOpts.plugins.push('jsx')
    },
    // ---
    visitor: {
      JSXElement(path, state) {
        var element =
          path.node && path.node.openingElement && path.node.openingElement.name

        if (!element) {
          return
        }

        switch (element.name) {
          case 'block':
          case 'flex':
          case 'row':
          case 'column':
          case 'row':
          case 'grid':
            transform(path.node, element.name)
            break
          case 'inline':
          case 'inlineblock':
          case 'inlineflex':
          case 'inlinegrid':
            transform(path.node, element.name, 'span')
            break
          // ONLY used in tests!!!
          case 'generic':
            transform(path.node, element.name)
            break
        }
      },
    },
  }
}
