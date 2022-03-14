/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2021-12-04 15:56:52
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import * as fs from 'fs';
import * as path from 'path';
import { types, NodePath, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';


/**
 *****************************************
 * 定义状态
 *****************************************
 */
interface State extends PluginPass {
    css?: void | {
        id?: types.Identifier;
        name: string;
        file: string;
        module: boolean;
    };
}


/**
 *****************************************
 * 判断是否为标识符
 *****************************************
 */
function isIdentifier(expr: object, value: string): expr is types.Identifier {
    return types.isIdentifier(expr) && expr.name === value;
}


/**
 *****************************************
 * 判断是否为字符串
 *****************************************
 */
function isStringLiteral(expr: object, value: string): expr is types.StringLiteral {
    return types.isStringLiteral(expr) && expr.value === value;
}


/**
 *****************************************
 * 判断文件是否存在
 *****************************************
 */
function isFile(file: string): boolean | undefined {
    try {
        return fs.statSync(file, { throwIfNoEntry: false })?.isFile();
    } catch (err) {
        return;
    }
}


/**
 *****************************************
 * 解析 CSS 样式文件
 *****************************************
 */
function resolveFile(file: string): void | string {
    const dirname = path.dirname(file);
    const basename = path.basename(file).slice(0, -4);
    const exts = ['.css', '.scss', '.less', '.sass'];
    const modes = ['', '.module', '.global'];

    // 遍历查找文件
    for (let ext of exts) {
        for (let mode of modes) {
            const id = path.join(dirname, `${basename}${mode}${ext}`);

            // 存在文件
            if (isFile(id)) {
                return id;
            }
        }
    }
}


/**
 *****************************************
 * 访问 Program 节点
 *****************************************
 */
function visitProgram(program: NodePath<types.Program>, { css }: State): void {
    if (!css) {
        return;
    }

    // 获取文档节点
    const { body } = program.node;
    const { name, file } = css;

    // 查找是否已经存在节点
    const node = body.find(expr => {
        return types.isImportDeclaration(expr) && [name, file].includes(expr.source.value);
    });

    // 已经节点
    if (node) {
        return;
    }

    // 添加模块节点
    if (css.module) {

        // 更新ID
        css.id = program.scope.generateUidIdentifier('cx');

        // 添加节点
        program.unshiftContainer(
            'body',
            types.importDeclaration(
                [types.importSpecifier(css.id, types.identifier('cx'))],
                types.stringLiteral(`${file}?module=1`)
            )
        );
    } else {
        program.unshiftContainer(
            'body',
            types.importDeclaration([], types.stringLiteral(file))
        );
    }
}


/**
 *****************************************
 * 访问 JSX 节点属性
 *****************************************
 */
function visitJSXAttribute(expr: NodePath<types.JSXAttribute>, { css }: State): void {
    if (!css || !css.id || expr.node.name.name !== 'className') {
        return;
    }

    // 获取节点内容
    const valuePath = expr.get('value');
    const valueNode = valuePath.node;
    const valueIdent = css.id;

    // 替换节点
    function replacePath(expr: types.Expression): void {
        valuePath.replaceWith(
            types.jsxExpressionContainer(types.callExpression(valueIdent, [expr]))
        );
    }

    // 获取配置表达式
    const valueExpr = (
        types.isJSXExpressionContainer(valueNode) ?
        valueNode.expression :
        valueNode
    );

    // 处理字符串配置
    if (types.isStringLiteral(valueExpr)) {
        const nodeExpr = valueExpr
            .value
            .split(' ')
            .map(value => types.stringLiteral(value));

        // 替换配置
        return replacePath(types.arrayExpression(nodeExpr));
    }

    // 判断是否为函数调用处理
    if (types.isCallExpression(valueExpr) && types.isMemberExpression(valueExpr.callee)) {
        const prop = valueExpr.callee.property;
        const args = valueExpr.arguments;

        // 判断是否为字符串拼接操作
        if (isIdentifier(prop, 'join') && args.length === 1 && isStringLiteral(args[0], ' ')) {
            return replacePath(valueExpr.callee.object);
        }
    }

    // 替换节点
    replacePath(
        types.callExpression(
            types.memberExpression(valueExpr as types.Expression, types.identifier('split')),
            [types.stringLiteral(' ')]
        )
    );
}


/**
 *****************************************
 * 插件选项
 *****************************************
 */
export interface Options {
    resolve?(file: string): void | string;
}


/**
 *****************************************
 * 定义插件
 *****************************************
 */
export default declare((api, opts: Options) => {
    const resolve = opts.resolve || resolveFile;
    const exts = ['.jsx', '.tsx'];

    // 校验版本
    api.assertVersion(7);

    // 返回接口
    return {
        name: 'inject-jsx-css-module',
        pre(this: State): void {
            if (this.filename && exts.includes(path.extname(this.filename))) {
                const file = resolve(this.filename);

                // 找到样式文件
                if (file) {
                    this.css = {
                        name: `./${path.basename(file)}`,
                        file,
                        module: !/\.global\.\w+/.test(file),
                    };
                }
            }
        },
        visitor: {
            Program: visitProgram,
            JSXAttribute: visitJSXAttribute
        },
    };
});