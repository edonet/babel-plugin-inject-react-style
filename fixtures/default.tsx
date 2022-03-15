/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2022-03-14 18:30:37
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import * as React from 'react';


/**
 *****************************************
 * 应用
 *****************************************
 */
export default function App(prop: { red: boolean, className: string }): JSX.Element {
    return (
        <div className="app">
            <div className={[prop.red ? 'red' : '', 'f12'].join(' ')}>app</div>
            <div className={prop.className}>detail</div>
        </div>
    );
}
