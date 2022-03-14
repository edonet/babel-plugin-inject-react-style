/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2022-03-14 17:56:03
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载样式
 *****************************************
 */
export default function cxLoader(locals: Record<string, string>): (value: string[]) => string {
    return function cx(value) {
        return value.map(str => locals[str] || str).join(' ');
    };
}
