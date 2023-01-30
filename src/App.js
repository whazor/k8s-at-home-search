import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "/home/runner/work/k8s-at-home-search/k8s-at-home-search/web/src/App.tsx";
import { Route, Routes } from 'react-router-dom';
import HelmRelease from './pages/helm-release';
import Home from './pages/index';
import styles from "./index.css?inline";
import { SearchBar } from './components/search';
import { denormalize } from './generators/helm-release/models';
export default function App(props) {
    const { pageData, } = props;
    const releases = denormalize(props).releases;
    return (_jsxDEV("div", Object.assign({ className: 'p-4 dark:bg-gray-900' }, { children: [_jsxDEV("style", { children: styles }, void 0, false, { fileName: _jsxFileName, lineNumber: 15, columnNumber: 7 }, this), _jsxDEV("nav", { children: [_jsxDEV("a", Object.assign({ href: '/k8s-at-home-search/' }, { children: _jsxDEV("h1", Object.assign({ className: "text-3xl dark:text-white" }, { children: "k8s at home search" }), void 0, false, { fileName: _jsxFileName, lineNumber: 19, columnNumber: 10 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 17, columnNumber: 9 }, this), _jsxDEV("p", Object.assign({ className: "text-lg dark:text-white" }, { children: "Search for a helm release" }), void 0, false, { fileName: _jsxFileName, lineNumber: 20, columnNumber: 9 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 16, columnNumber: 7 }, this), _jsxDEV("div", Object.assign({ className: 'pt-2' }, { children: [_jsxDEV("div", Object.assign({ className: 'mb-4' }, { children: _jsxDEV(SearchBar, { releases: releases }, void 0, false, { fileName: _jsxFileName, lineNumber: 24, columnNumber: 11 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 23, columnNumber: 9 }, this), _jsxDEV(Routes, { children: [_jsxDEV(Route, { path: "/", element: _jsxDEV(Home, { releases: releases }, void 0, false, { fileName: _jsxFileName, lineNumber: 27, columnNumber: 48 }, this) }, "/", false, { fileName: _jsxFileName, lineNumber: 27, columnNumber: 11 }, this), releases.map(({ key, chart, release }) => {
                                return (_jsxDEV(Route, { path: `/hr/${key}`, element: _jsxDEV(HelmRelease, Object.assign({}, { chart, release }, { url: '/hr/' + key, pageData: pageData, keyFileMap: props.keyFileMap }), void 0, false, { fileName: _jsxFileName, lineNumber: 33, columnNumber: 26 }, this) }, 'hr-' + key, false, { fileName: _jsxFileName, lineNumber: 29, columnNumber: 21 }, this));
                            })] }, void 0, true, { fileName: _jsxFileName, lineNumber: 26, columnNumber: 9 }, this)] }), void 0, true, { fileName: _jsxFileName, lineNumber: 22, columnNumber: 7 }, this)] }), void 0, true, { fileName: _jsxFileName, lineNumber: 13, columnNumber: 11 }, this));
}
//# sourceMappingURL=App.js.map