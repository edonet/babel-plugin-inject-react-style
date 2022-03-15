# babel-plugin-inject-react-style
A babel plugin for inject css style into react jsx element!

## Install
``` shell
$ yarn add babel-plugin-inject-react-style
```

## Usage
Add setting in `.babelrc`:
``` json
{
    "plugins": ["babel-plugin-inject-react-style"]
}
```

## Example
in
``` jsx
export default function App(): JSX.Element {
    return (
        <div className="app red">app</div>
    );
}
```
out
``` jsx
import cxLoader from 'babel-plugin-inject-react-style/dist/cx-loader.js';
import styles from './app.css';

const cx = cxLoader(styles);

export default function App(): JSX.Element {
    return (
        <div className={cx(["app", "red"])}>app</div>
    );
}
```
