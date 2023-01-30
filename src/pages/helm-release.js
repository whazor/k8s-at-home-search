import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const _jsxFileName = "/home/runner/work/k8s-at-home-search/k8s-at-home-search/web/src/pages/helm-release.tsx";
import Icon from '../components/icon';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';
import Heading from '../components/heading';
import Text from '../components/text';
import Code from '../components/code';
import Table from '../components/table';
dayjs.extend(relativeTime);
const STAR_THRESHOLD = 30;
const MAX_REPOS = 5;
function ValueRow(props) {
    const { name, count, types, urls, values } = props;
    const [show, setShow] = useState(false);
    const urlNames = Object.fromEntries(urls.map(u => [u, u.split("/").slice(3, 5).join("/")]));
    const shouldDrawArray = name.endsWith("[]");
    return (_jsxDEV("div", Object.assign({ className: 'max-w-md break-words' }, { children: [_jsxDEV("a", Object.assign({ className: 'text-blue-500 hover:text-blue-700 hover:underline cursor-pointer', onClick: () => setShow(!show) }, { children: [name, " (", count, ")"] }), void 0, true, { fileName: _jsxFileName, lineNumber: 37, columnNumber: 7 }, this), show && values &&
                _jsxDEV(Table, { headers: ['Value', 'Repo'], rows: values.map(([url, value]) => ({
                        key: 'show-values' + props.name + url,
                        data: [
                            _jsxDEV("div", Object.assign({ className: 'max-w-md break-words' }, { children: value.map((v) => [
                                    shouldDrawArray ? "- " + v : v,
                                    _jsxDEV("br", {}, void 0, false, { fileName: _jsxFileName, lineNumber: 48, columnNumber: 20 }, this)
                                ]) }), void 0, false, { fileName: _jsxFileName, lineNumber: 44, columnNumber: 20 }, this),
                            _jsxDEV("div", { children: _jsxDEV("a", Object.assign({ href: url, target: "_blank", className: 'text-blue-500 hover:text-blue-700 hover:underline cursor-pointer' }, { children: urlNames[url] }), void 0, false, { fileName: _jsxFileName, lineNumber: 53, columnNumber: 17 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 51, columnNumber: 23 }, this)
                        ]
                    })) }, void 0, false, { fileName: _jsxFileName, lineNumber: 40, columnNumber: 25 }, this)] }), void 0, true, { fileName: _jsxFileName, lineNumber: 35, columnNumber: 11 }, this));
}
export default function HR(props) {
    const [pageData, setPageData] = useState(props.pageData);
    const [showAll, setShowAll] = useState(false);
    useEffect(() => {
        if (!pageData) {
            const file = props.keyFileMap[props.url];
            fetch(`./data-${file}.json`)
                .then(res => res.json())
                .then((data) => data[props.url])
                .then(setPageData);
        }
    }, [pageData, props.url]);
    if (!pageData && !(props.url in props.keyFileMap))
        return (_jsxDEV("div", { children: ["Not found: ", props.url] }, void 0, true, { fileName: _jsxFileName, lineNumber: 82, columnNumber: 13 }, this));
    if (!pageData)
        return (_jsxDEV("div", { children: "Loading..." }, void 0, false, { fileName: _jsxFileName, lineNumber: 84, columnNumber: 25 }, this));
    const { name, doc, repos, icon, values: valueResult, helmRepoName, helmRepoURL } = pageData;
    const urlMap = valueResult.urlMap;
    const valueList = valueResult.list.map(v => (Object.assign(Object.assign({}, v), { urls: v.urls.map(u => urlMap[u]) })));
    const valueMap = valueResult.valueMap;
    const docUrl = `https://github.com/whazor/k8s-at-home-search/new/main/?filename=web/src/info/${name}.md`;
    const needsFilter = repos.filter(rel => rel.stars > STAR_THRESHOLD).length > MAX_REPOS;
    // sort by timestamp
    const top = repos
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter(rel => rel.stars > STAR_THRESHOLD || !needsFilter)
        .slice(0, MAX_REPOS);
    const repoCount = Math.min(showAll ? repos.length : MAX_REPOS, repos.length);
    return (_jsxDEV(_Fragment, { children: [_jsxDEV(Heading, Object.assign({ type: 'h1' }, { children: [icon && _jsxDEV(Icon, { icon: icon }, void 0, false, { fileName: _jsxFileName, lineNumber: 109, columnNumber: 34 }, this), " ", name, " helm"] }), void 0, true, { fileName: _jsxFileName, lineNumber: 109, columnNumber: 7 }, this), _jsxDEV("div", { className: 'mb-4 dark:text-slate-200', dangerouslySetInnerHTML: {
                    __html: doc ||
                        `No introduction found. <a href="${docUrl}" target="_blank" class="text-blue-500 hover:text-blue-700 hover:underline">Create it?</a>`
                } }, void 0, false, { fileName: _jsxFileName, lineNumber: 110, columnNumber: 7 }, this), _jsxDEV(Heading, Object.assign({ type: 'h2' }, { children: "Install" }), void 0, false, { fileName: _jsxFileName, lineNumber: 115, columnNumber: 7 }, this), _jsxDEV(Text, { children: "Install with:" }, void 0, false, { fileName: _jsxFileName, lineNumber: 116, columnNumber: 7 }, this), _jsxDEV(Code, { children: `helm repo add ${helmRepoName} ${helmRepoURL}
helm install ${name} ${helmRepoName}/${name} -f values.yaml` }, void 0, false, { fileName: _jsxFileName, lineNumber: 117, columnNumber: 7 }, this), _jsxDEV(Heading, Object.assign({ type: 'h2' }, { children: [showAll ? 'All' : 'Top', " Repositories (", repoCount, " out of ", repos.length, ")"] }), void 0, true, { fileName: _jsxFileName, lineNumber: 121, columnNumber: 7 }, this), _jsxDEV(Text, { children: "See examples from other people:" }, void 0, false, { fileName: _jsxFileName, lineNumber: 124, columnNumber: 7 }, this), _jsxDEV(Table, { headers: ['Name', 'Repo', 'Stars', 'Version', 'Timestamp'], rows: (!showAll ? top : repos).map(repo => ({
                    key: 'examples' + repo.url,
                    data: [
                        _jsxDEV("a", Object.assign({ href: repo.url, target: '_blank', className: 'text-blue-500 hover:text-blue-700 hover:underline cursor-pointer' }, { children: [repo.icon && _jsxDEV(Icon, { icon: repo.icon }, void 0, false, { fileName: _jsxFileName, lineNumber: 133, columnNumber: 30 }, this), repo.name] }), void 0, true, { fileName: _jsxFileName, lineNumber: 129, columnNumber: 14 }, this),
                        _jsxDEV("a", Object.assign({ href: repo.repo_url, target: '_blank', className: 'text-blue-500 hover:text-blue-700 hover:underline cursor-pointer' }, { children: repo.repo }), void 0, false, { fileName: _jsxFileName, lineNumber: 135, columnNumber: 20 }, this),
                        repo.stars,
                        repo.chart_version,
                        dayjs.unix(repo.timestamp).fromNow()
                    ]
                })) }, void 0, false, { fileName: _jsxFileName, lineNumber: 125, columnNumber: 7 }, this), !showAll && _jsxDEV("button", Object.assign({ className: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 mb-6', onClick: () => setShowAll(!showAll) }, { children: ["See all ", repos.length, " releases"] }), void 0, true, { fileName: _jsxFileName, lineNumber: 144, columnNumber: 19 }, this), _jsxDEV(Heading, Object.assign({ type: 'h2' }, { children: "Values" }), void 0, false, { fileName: _jsxFileName, lineNumber: 147, columnNumber: 7 }, this), _jsxDEV(Text, { children: "See the most popular values for this chart:" }, void 0, false, { fileName: _jsxFileName, lineNumber: 148, columnNumber: 7 }, this), _jsxDEV(Table, { headers: ['Key', 'Types'], rows: valueList.map(({ name, count, types, urls }) => ({
                    key: 'popular-repos-values' + name,
                    data: [
                        _jsxDEV(ValueRow, Object.assign({}, { name, count, types, urls }, { values: name in valueMap ?
                                Object.entries(valueMap[name]).map(([k, v]) => [urlMap[k], v])
                                : [] }), void 0, false, { fileName: _jsxFileName, lineNumber: 152, columnNumber: 18 }, this),
                        types.join(", "),
                    ]
                })) }, void 0, false, { fileName: _jsxFileName, lineNumber: 149, columnNumber: 7 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 107, columnNumber: 11 }, this));
}
//# sourceMappingURL=helm-release.js.map