import escodegen from 'escodegen';
import parseAst from '../parseAst';

const acorn = require('acorn');

/** parseWon 需要传入wue 因为需要拿到wue.methods */
const parseWOn = (expression, data, wue) => {
  let handles = [];
  /** 去最末尾冒号 否则Ast解析会报语法错误 */
  const parse = acorn.parse(`(${expression.replace(/;$/, '')})`);
  const parseBody = parse.body[0];

  if (parseBody.type === 'ExpressionStatement') {
    if (parseBody.expression.type === 'Identifier') {
      console.log('I m Identifier');
      const { name } = parseBody.expression;
      if (wue.methods[name]) {
        handles.push(wue.methods[name].bind(wue));
        return handles;
      }
      /** 先随便报个错 -。- */
      throw new Error(`wue.methods not method is ${name}`);
    }
    if (parseBody.expression.type === 'CallExpression') {
      console.log('I m CallExpression');
      console.log(data, 'data');
      let arg = parseBody.expression.arguments;
      const { callee: { name } } = parseBody.expression;
      if (wue.methods[name]) {
        arg = arg.map((node) => {
          if (node.type === 'Literal') return node.value;
          return parseAst(escodegen.generate(node), data);
        });
        handles.push(() => wue.methods[name].apply(wue, arg));
        return handles;
      }
    }
    if (parseBody.expression.type === 'UpdateExpression') {
      console.log('I m UpdateExpression');
      const { prefix, operator, argument: { name } } = parseBody.expression;
      const val = parseAst(name, data);
      const handle = new Function(`var tml = ${val}; ${prefix ? `${operator}tml` : `tml${operator}`}; return tml;`);
      handles.push(setTemplateValue.bind(null, data, name, handle()));
    }
    if (parseBody.expression.type === 'BinaryExpression') {
      console.log('I m binaryExpression');
      /** 二元表达式其实也没什么卵用 -。- 不会改变模板的数据啥的 */
      handles.push(parseAst(expression, data));
    }
    if (parseBody.expression.type === 'AssignmentExpression') {
      console.log('I m AssignmentExpression');
      // console.log( 'expression is AssignmentExpression' );
      const { left: { name }, operator, right } = parseBody.expression;
      // console.log(`var tml = "${parseAst(name, data)}"; tml${operator}"${parseAst(escodegen.generate(right), data)}"; return tml;`);
      const handle = new Function(`var tml = "${parseAst(name, data)}"; tml${operator}"${parseAst(escodegen.generate(right), data)}"; return tml;`);
      handles.push(setTemplateValue.bind(null, data, name, handle()));
    }
    if (parseBody.expression.type === 'ArrowFunctionExpression' || parseBody.expression.type === 'FunctionExpression') {
      const functionBody = parseBody.expression.body;
      return functionBody.type === 'BlockStatement'
        ? (functionBody.body.length > 0 ? parseWOn(escodegen.generate(functionBody.body[0]), data) : handles)
        : parseWOn(escodegen.generate(functionBody), data);
    }
    if (parseBody.expression.type === 'SequenceExpression') {
      console.log('I m SequenceExpression');
      // console.log( parseBody )
      /* 如果在wue.methods未找到方法应该 抛出错误 */
      const methods = parseBody.expression.expressions;
      methods.forEach(node => handles = handles.concat(parseWOn(escodegen.generate(node), data, wue)));
    }
  }
  return handles;
};

export default parseWOn;
