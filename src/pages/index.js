import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const _jsxFileName = "/home/runner/work/k8s-at-home-search/k8s-at-home-search/web/src/pages/index.tsx";
import Icon from "../components/icon";
import Heading from "../components/heading";
export default function Home(props) {
    return (_jsxDEV(_Fragment, { children: [_jsxDEV(Heading, Object.assign({ type: "h2" }, { children: "Popular releases" }), void 0, false, { fileName: _jsxFileName, lineNumber: 9, columnNumber: 9 }, this), props.releases.sort((a, b) => b.count - a.count).filter(a => a.count > 5).map(({ key, chart, icon, release }) => {
                return (_jsxDEV("a", Object.assign({ href: `/k8s-at-home-search/hr/${key}`, className: " cursor-pointer text-lg rounded pb-0 pt-0 px-1 m-1 mb-0 inline-block ml-0 border-1 \n              dark:text-white dark:bg-gray-800 dark:border-gray-800 hover:bg-gray-200 hover:border-gray-200 dark:hover:bg-gray-700\n              " }, { children: [icon && _jsxDEV(Icon, { icon: icon }, void 0, false, { fileName: _jsxFileName, lineNumber: 16, columnNumber: 25 }, this), ' ', release] }), 'wordcloud-' + key, true, { fileName: _jsxFileName, lineNumber: 11, columnNumber: 19 }, this));
            })] }, void 0, true, { fileName: _jsxFileName, lineNumber: 7, columnNumber: 13 }, this));
}
//# sourceMappingURL=index.js.map