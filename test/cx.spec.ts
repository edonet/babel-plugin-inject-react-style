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
import bind from '../src/cx-loader';


/**
 *****************************************
 * 测试模块
 *****************************************
 */
describe('cx', () => {

    /* bind style */
    test('bind style', () => {
        const cx = bind({ app: 'app-v1', red: 'red-v2' });

        // 校验结果
        expect(cx([])).toBe('');
        expect(cx(['app'])).toBe('app-v1');
        expect(cx(['app', 'red'])).toBe('app-v1 red-v2');
        expect(cx(['app', 'red1'])).toBe('app-v1 red1');
        expect(cx(['app', 'red-v2'])).toBe('app-v1 red-v2');
    });
});
