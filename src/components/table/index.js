import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "/home/runner/work/k8s-at-home-search/k8s-at-home-search/web/src/components/table/index.tsx";
export default function (props) {
    return _jsxDEV("table", Object.assign({ className: "table-auto w-full" }, { children: [_jsxDEV("thead", Object.assign({ className: "border-b" }, { children: _jsxDEV("tr", { children: props.headers.map((header) => {
                        return _jsxDEV("th", Object.assign({ className: "text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-white" }, { children: header }), header, false, { fileName: _jsxFileName, lineNumber: 12, columnNumber: 27 }, this);
                    }) }, void 0, false, { fileName: _jsxFileName, lineNumber: 10, columnNumber: 13 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 9, columnNumber: 9 }, this), _jsxDEV("tbody", { children: props.rows.map((row) => {
                    return _jsxDEV("tr", { children: row.data.map((cell) => {
                            return _jsxDEV("td", Object.assign({ className: "border-t dark:border-gray-800 px-4 py-2 text-sm dark:text-white" }, { children: cell }), void 0, false, { fileName: _jsxFileName, lineNumber: 23, columnNumber: 31 }, this);
                        }) }, row.key, false, { fileName: _jsxFileName, lineNumber: 21, columnNumber: 23 }, this);
                }) }, void 0, false, { fileName: _jsxFileName, lineNumber: 19, columnNumber: 9 }, this)] }), void 0, true, { fileName: _jsxFileName, lineNumber: 8, columnNumber: 11 }, this);
}
//# sourceMappingURL=index.js.map