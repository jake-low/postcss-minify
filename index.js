const selectorParser = require("postcss-selector-parser");
const valueParser = require("postcss-value-parser");

const selectorProcessor = selectorParser((selectors) => {
  selectors.walk((selector) => {
    selector.spaces = { before: '', after: '' }
    if (selector.raws && selector.raws.spaces) {
      selector.raws.spaces = {}
    }
  })
})

function minifySelector(str) {
  return selectorProcessor.processSync(str)
}

function minifyValue(str) {
  const parsed = valueParser(str.trim())
  parsed.walk((node) => {
    switch (node.type) {
      case "div":
        node.before = ""
        node.after = ""
        break
      case "space":
        node.value = " "
        break
    }
  })
  return parsed.toString()
}

module.exports = () => {
  return {
    postcssPlugin: "postcss-minify",

    Comment: (comment) => {
      if (comment.text[0] === '!') {
        comment.raws.before = ""
        comment.raws.after = ""
      } else {
        comment.remove()
      }
    },

    Declaration: (decl) => {
      decl.raws = { before: "", between: ":" }
      decl.value = minifyValue(decl.value);
    },

    Rule: (rule) => {
      rule.raws = { before: "", between: "", after: "", semicolon: false }
      rule.selector = minifySelector(rule.selector)
    }
  }
}

module.exports.postcss = true
