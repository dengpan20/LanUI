import assert from 'node:assert/strict'
import vm from 'node:vm'
import { poolStableGlobals } from './minify-library-js.mjs'

const source = `
// Object.entries Object.entries Object.entries must stay in this comment.
const literal = "Array.isArray Object.entries Object.prototype.hasOwnProperty.call";
const template = \`Object.entries Object.entries Object.entries\`;
const expression = /Object\\.entries Object\\.entries/;
const input = { alpha: 1, beta: 2 };
globalThis.result = {
  entries: [Object.entries(input).length, Object.entries(input).length, Object.entries(input).length],
  own: [Object.prototype.hasOwnProperty.call(input, 'alpha'), Object.prototype.hasOwnProperty.call(input, 'beta'), Object.prototype.hasOwnProperty.call(input, 'missing')],
  literal, template, regexp: expression.source,
};
`
const output = poolStableGlobals(source)
assert.notEqual(output, source)
assert.match(output, /Object\.entries Object\.entries Object\.entries/)
assert.match(output, /Array\.isArray Object\.entries Object\.prototype\.hasOwnProperty\.call/)
assert.equal(output.includes('const expression = /Object\\.entries Object\\.entries/;'), true)
const context = {}
vm.runInNewContext(output, context)
assert.deepEqual(Array.from(context.result.entries), [2, 2, 2])
assert.deepEqual(Array.from(context.result.own), [true, true, false])
assert.equal(context.result.literal, 'Array.isArray Object.entries Object.prototype.hasOwnProperty.call')
assert.equal(context.result.template, 'Object.entries Object.entries Object.entries')
assert.equal(context.result.regexp, 'Object\\.entries Object\\.entries')
console.log('MINIFIER_AST_REGRESSION PASS executable=member-calls strings=preserved templates=preserved regex=preserved comments=preserved hasOwn=receiver-safe')
