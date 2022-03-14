/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2022-03-14 18:38:49
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { transformFileSync } from '@babel/core';
import inject from '../src';


/**
 *****************************************
 * 转换选项
 *****************************************
 */
const options = {
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    plugins: [[inject]],
};


/**
 *****************************************
 * 测试模块
 *****************************************
 */
describe('inject', () => {

    /* inject jsx global style */
    test('inject jsx global style', () => {
        const result = transformFileSync('./fixtures/app.tsx', options);

        // 不存在结果
        if (!result || !result.code) {
            return;
        }

        // 匹配样式
        const { code } = result;
        const indexOf = (value: string): boolean => code.indexOf(value) !== -1;

        // 校验对象
        expect(indexOf('app.scss')).toBe(true);
        expect(indexOf('babel-plugin-inject-react-style/cx-loader')).toBe(false);
        expect(indexOf('className: "app"')).toBe(true);
        expect(indexOf('className: [prop.red ? \'red\' : \'\', \'f12\'].join(\' \')')).toBe(true);
        expect(indexOf('className: prop.className')).toBe(true);
        expect(indexOf('className: _cx(["app"])')).toBe(false);
        expect(indexOf('className: _cx([prop.red ? \'red\' : \'\', \'f12\'])')).toBe(false);
        expect(indexOf('className: _cx(prop.className.split(" "))')).toBe(false);
    });

    /* inject jsx module style */
    test('inject jsx module style', () => {
        const result = transformFileSync('./fixtures/index.tsx', options);

        // 不存在结果
        if (!result || !result.code) {
            return;
        }

        // 匹配样式
        const { code } = result;
        const indexOf = (value: string): boolean => code.indexOf(value) !== -1;

        // 校验对象
        expect(indexOf('index.module.scss')).toBe(true);
        expect(indexOf('babel-plugin-inject-react-style/cx-loader')).toBe(true);
        expect(indexOf('className: "app"')).toBe(false);
        expect(indexOf('className: [prop.red ? \'red\' : \'\', \'f12\'].join(\' \')')).toBe(false);
        expect(indexOf('className: prop.className')).toBe(false);
        expect(indexOf('className: _cx(["app"])')).toBe(true);
        expect(indexOf('className: _cx([prop.red ? \'red\' : \'\', \'f12\'])')).toBe(true);
        expect(indexOf('className: _cx(prop.className.split(" "))')).toBe(true);
    });
});
