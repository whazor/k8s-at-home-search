import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "/home/runner/work/k8s-at-home-search/k8s-at-home-search/web/src/components/heading/index.tsx";
export default function (props) {
    let textSizeClass;
    if (props.type === "h1") {
        textSizeClass = "text-3xl";
    }
    else if (props.type === "h2") {
        textSizeClass = "text-2xl";
    }
    else if (props.type === "h3") {
        textSizeClass = "text-xl";
    }
    else if (props.type === "h4") {
        textSizeClass = "text-lg";
    }
    else if (props.type === "h6") {
        textSizeClass = "text-sm";
    }
    else {
        textSizeClass = "text-base";
    }
    return _jsxDEV("h1", Object.assign({ className: `font-bold ${textSizeClass} dark:text-white` }, { children: props.children }), void 0, false, { fileName: _jsxFileName, lineNumber: 17, columnNumber: 11 }, this);
}
//# sourceMappingURL=index.js.map