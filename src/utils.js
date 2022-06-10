'use strict'

var printAST = require('ast-pretty-print')
var t = require('@babel/types')

const BASE_PROPS_TO_OMIT = {
  $: true,
}

/**
 * @param {babel.types} t
 * @param {string} className
 * @param {any} otherClassName
 * @return {any} className prop with styles
 */
function buildClassNamePropFunction(t, className, otherClassName) {
  // Combine passed in className and cssLiteral
  if (otherClassName != null) {
    const quasis = []
    const expressions = []
    let text = `${className} `

    const finalize = (expr, str) => {
      quasis.push(t.templateElement({ raw: text }))
      expressions.push(expr)
      text = str
    }

    if (t.isStringLiteral(otherClassName)) {
      text += `${otherClassName.value} `
    } else if (t.isExpression(otherClassName)) {
      finalize(otherClassName, ' ')
    }

    quasis.push(t.templateElement({ raw: `${text}` }))

    return t.jSXAttribute(
      t.jSXIdentifier('className'),
      t.jSXExpressionContainer(t.templateLiteral(quasis, expressions)),
    )
  }

  // No user-passed in className, so
  return t.jSXAttribute(
    t.jSXIdentifier('className'),
    t.jSXExpressionContainer(t.stringLiteral(className)),
  )
}

function addTemplateToTemplate(target, template) {
  if (template.expressions.length > 0) {
    if (target.expressions.length === target.quasis.length) {
      // safe to just push these
      target.expressions = target.expressions.concat(
        template.expressions.slice(0),
      )
      target.quasis = target.quasis.concat(template.quasis.slice(0))
    } else {
      target.expressions = target.expressions.concat(
        template.expressions.slice(0),
      )

      // concate the first quasi, then push on the rest
      addStringToTemplate(target, template.quasis[0].value.raw)
      target.quasis = target.quasis.concat(template.quasis.slice(1))
    }
  } else {
    addStringToTemplate(target, template.quasis[0].value.raw)
  }
}

function addStringToTemplate(template, str) {
  var last = template.quasis.length - 1

  template.quasis[last].value.raw = template.quasis[last].value.raw + str
  template.quasis[last].value.cooked = template.quasis[last].value.cooked + str
}

function addQuasiToTemplate(template, quasi) {
  template.quasis.push(quasi)
}

function addExpressionToTemplate(template, expression) {
  template.expressions.push(expression)
}

/**
 * @param {JSXElement} node
 * @param {string} defaultTag
 */
function renameTag(node, defaultTag = 'div') {
  let tagName = defaultTag

  // Get the prop responsible for the tag
  const tagProp = node.openingElement.attributes
    .filter(t.isJSXAttribute)
    .find((prop) => {
      return prop.name.name === '$'
    })

  // Use the value of the prop...
  if (tagProp !== undefined) {
    const { value: tagValue } = tagProp

    if (t.isStringLiteral(tagValue)) {
      tagName = tagValue.value
    } else if (t.isJSXExpressionContainer(tagValue)) {
      if (t.isStringLiteral(tagValue.expression)) {
        tagName = tagValue.expression.value
      } else if (t.isIdentifier(tagValue.expression)) {
        // TODO return React.createElement() to handle case where identifier is lowercase
        // @see https://github.com/Chronstruct/primitives/issues/64
        tagName = tagValue.expression.name
      }
    }
  }

  // ...to overwrite the original element tags
  node.openingElement.name.name = tagName

  if (node.closingElement) {
    node.closingElement.name.name = tagName
  }
}

/**
 * @param {Object} staticStyle
 * @param {Object} dynamicStyle
 * @param {Types.JSXAttribute} jsxAttribute
 * @param {Object} propertiesToAdd
 * @return {any} className prop with styles
 */
function addBooleanPropertySet(
  staticStyle,
  dynamicStyle,
  jsxAttribute,
  propertiesToAdd,
) {
  var { value } = jsxAttribute
  //   console.log("attribute", attribute)

  if (isShorthandBooleanProp(jsxAttribute)) {
    addCssProperties(staticStyle, dynamicStyle, propertiesToAdd)
  } else if (t.isJSXExpressionContainer(value)) {
    var { expression } = value

    if (t.isBooleanLiteral(expression) && expression.value === true) {
      addCssProperties(staticStyle, dynamicStyle, propertiesToAdd)
    }
  }
}

// const defaultAddBooleanPropertyConfig = {
//   allowString: false,
//   allowNumber: false,
// }
/**
 * @param {Object} staticStyle
 * @param {Object} dynamicStyle
 * @param {JSXAttribute} jsxAttribute
 * @param {string} key - key to apply to staticStyle
 * @param {{true: any, false: any}} valueMap - used to convert from boolean values
 * @param {{allowString: boolean, allowNumber: boolean}} config - which non-boolean values are allowed
 * @return {void}
 */
function addBooleanProperty(
  staticStyle,
  dynamicStyle,
  jsxAttribute,
  key,
  valueMap,
  config,
) {
  var { value } = jsxAttribute

  // e.g. grow="1" (NOT SUPPORTED by default)
  if (isStringProp(jsxAttribute) && !(config && config.allowString)) {
    return
  } else if (isShorthandBooleanProp(jsxAttribute)) {
    addCssProperty(staticStyle, dynamicStyle, key, valueMap[true])
  } else if (isExpressionProp(jsxAttribute)) {
    var { expression } = value

    // console.log(expression)

    // e.g. grow={1} (NOT SUPPORTED by default)
    if (t.isNumericLiteral(expression) && !(config && config.allowNumber)) {
      return
    }
    // e.g. grow={"1"} (NOT SUPPORTED by default)
    else if (t.isStringLiteral(expression) && !(config && config.allowString)) {
      return
    }
    // e.g. grow={true}
    else if (t.isBooleanLiteral(expression)) {
      addCssProperty(staticStyle, dynamicStyle, key, valueMap[expression.value])
    }
    // e.g. grow={{'': true, 'hover': false}}
    else if (t.isObjectExpression(expression)) {
      addCssProperty(staticStyle, dynamicStyle, key, expression, valueMap)
    } else {
      addCssProperty(
        staticStyle,
        dynamicStyle,
        key,
        expression in valueMap ? valueMap[expression] : expression,
      )
    }
  } else {
    addCssProperty(
      staticStyle,
      dynamicStyle,
      key,
      value in valueMap ? valueMap[value] : value,
    )
  }
}

/**
 * e.g. bold
 * @param {JSXAttribute} jsxAttribute
 * @return {boolean}
 */
function isShorthandBooleanProp(jsxAttribute) {
  return jsxAttribute.value === null
}

/**
 * e.g. bold={_}
 * @param {JSXAttribute} jsxAttribute
 * @return {boolean}
 */
function isExpressionProp(jsxAttribute) {
  return t.isJSXExpressionContainer(jsxAttribute.value)
}

/**
 * e.g. bold="_"
 * @param {JSXAttribute} jsxAttribute
 * @return {boolean}
 */
function isStringProp(jsxAttribute) {
  return t.isStringLiteral(jsxAttribute.value)
}

exports.BASE_PROPS_TO_OMIT = BASE_PROPS_TO_OMIT
exports.buildClassNamePropFunction = buildClassNamePropFunction
exports.addTemplateToTemplate = addTemplateToTemplate
exports.addStringToTemplate = addStringToTemplate
exports.addQuasiToTemplate = addQuasiToTemplate
exports.addExpressionToTemplate = addExpressionToTemplate
exports.renameTag = renameTag
exports.addBooleanPropertySet = addBooleanPropertySet
exports.addBooleanProperty = addBooleanProperty
