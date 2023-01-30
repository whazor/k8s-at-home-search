import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "/home/runner/work/k8s-at-home-search/k8s-at-home-search/web/src/components/search/index.tsx";
import { useState } from "react";
export function SearchBar(props) {
    const [search, setSearch] = useState('');
    const simplifyURL = (url) => {
        // get domain
        let domain = url.replace(/https?:\/\//, '').split('/')[0];
        // remove tld
        domain = domain.split('.').slice(0, -1).join('.');
        // remove charts.
        domain = domain.replace(/^charts\./, '');
        // remove www
        domain = domain.replace(/^www\./, '');
        // remove github
        domain = domain.replace(/\.github$/, '');
        return domain;
    };
    const fullHeight = "max-h-128";
    const peerFullHeight = "peer-focus:max-h-128";
    const searches = props.releases
        .filter(_ => search.length > 0)
        .filter(({ chart, release, chartsUrl }) => {
        return chart.toLowerCase().includes(search.toLowerCase()) || release.toLowerCase().includes(search.toLowerCase()) || simplifyURL(chartsUrl).toLowerCase().includes(search.toLowerCase());
    });
    return _jsxDEV("label", { children: [_jsxDEV("span", Object.assign({ className: 'sr-only dark:text-white' }, { children: "Search for a chart:" }), void 0, false, { fileName: _jsxFileName, lineNumber: 28, columnNumber: 9 }, this), _jsxDEV("input", { className: 'peer bg-slate-50 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 dark:bg-black dark:text-white dark:border-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-500', type: "text", placeholder: "Search for a chart...", value: search, onChange: (e) => {
                    setSearch(e.target.value);
                } }, void 0, false, { fileName: _jsxFileName, lineNumber: 29, columnNumber: 9 }, this), _jsxDEV("div", Object.assign({ className: `${search === "" ? "max-h-0" : fullHeight} overflow-hidden ease-in-out duration-300 transition-[max-height] ${peerFullHeight}` }, { children: search !== "" &&
                    _jsxDEV("table", Object.assign({ className: "w-full m-2 dark:text-white" }, { children: [_jsxDEV("thead", { children: _jsxDEV("tr", { children: [_jsxDEV("th", Object.assign({ className: "text-left" }, { children: "Release" }), void 0, false, { fileName: _jsxFileName, lineNumber: 43, columnNumber: 25 }, this), _jsxDEV("th", Object.assign({ className: "text-left" }, { children: "Chart" }), void 0, false, { fileName: _jsxFileName, lineNumber: 44, columnNumber: 25 }, this), _jsxDEV("th", Object.assign({ className: "text-left" }, { children: "Count" }), void 0, false, { fileName: _jsxFileName, lineNumber: 45, columnNumber: 25 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 42, columnNumber: 21 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 41, columnNumber: 17 }, this), _jsxDEV("tbody", { children: searches.map(({ key, chart, release, chartsUrl, count }) => {
                                    return _jsxDEV("tr", { children: [_jsxDEV("td", { children: _jsxDEV("a", Object.assign({ href: `/k8s-at-home-search/hr/${key}` }, { children: release }), void 0, false, { fileName: _jsxFileName, lineNumber: 52, columnNumber: 33 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 52, columnNumber: 29 }, this), _jsxDEV("td", { children: _jsxDEV("a", Object.assign({ href: `/k8s-at-home-search/hr/${key}` }, { children: simplifyURL(chartsUrl) + '/' + chart }), void 0, false, { fileName: _jsxFileName, lineNumber: 53, columnNumber: 33 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 53, columnNumber: 29 }, this), _jsxDEV("td", { children: _jsxDEV("a", Object.assign({ href: `/k8s-at-home-search/hr/${key}` }, { children: count }), void 0, false, { fileName: _jsxFileName, lineNumber: 56, columnNumber: 33 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 56, columnNumber: 29 }, this)] }, 'hr-release' + key, true, { fileName: _jsxFileName, lineNumber: 51, columnNumber: 31 }, this);
                                }) }, void 0, false, { fileName: _jsxFileName, lineNumber: 48, columnNumber: 17 }, this)] }), void 0, true, { fileName: _jsxFileName, lineNumber: 39, columnNumber: 30 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 38, columnNumber: 9 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 27, columnNumber: 11 }, this);
}
//# sourceMappingURL=index.js.map