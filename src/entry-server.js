import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "/home/runner/work/k8s-at-home-search/k8s-at-home-search/web/src/entry-server.tsx";
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
export function render(url, appData, pageData) {
    return ReactDOMServer.renderToString(_jsxDEV(StaticRouter, Object.assign({ location: url, basename: '/k8s-at-home-search/' /*context={context}*/ }, { children: _jsxDEV(App, Object.assign({}, appData, { pageData: pageData }), void 0, false, { fileName: _jsxFileName, lineNumber: 10, columnNumber: 7 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 8, columnNumber: 40 }, this));
}
//# sourceMappingURL=entry-server.js.map