const t = require("@babel/types")
const parser = require("@babel/parser")
const { renameTag } = require("../src/utils")

/**
 * @param {string} node
 */
const parse = (node) => parser.parseExpression(node, { plugins: ["jsx"] })

describe("renameTag()", () => {
  it("handles string literals", () => {
    // GIVEN
    const expectedTagName = "xxx"
    var input = parse(`<div $="${expectedTagName}"/>`)

    // WHEN
    renameTag(input)

    // THEN
    expect(input.openingElement.name.name).toEqual(expectedTagName)
  })

  it("handles string expressions", () => {
    // GIVEN
    const expectedTagName = "xxx"
    var input = parse(`<div $={"${expectedTagName}"}/>`)

    // WHEN
    renameTag(input)

    // THEN
    expect(input.openingElement.name.name).toEqual(expectedTagName)
  })

  it("handles variable expressions", () => {
    // GIVEN
    const expectedTagName = "xxx"
    var input = parse(`<div $={${expectedTagName}}/>`)

    // WHEN
    renameTag(input)

    // THEN
    expect(input.openingElement.name.name).toEqual(expectedTagName)
  })
})
