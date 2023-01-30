import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.mjs";
import { Routes, Route } from "react-router-dom";
import { Icon as Icon$1 } from "@iconify/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { useState, useEffect } from "react";
function Icon(props) {
  const name = (!props.icon.includes(":") ? "mdi:" : "") + props.icon;
  return props.icon && /* @__PURE__ */ jsx(Icon$1, { icon: name, className: "text-base align-middle leading-none inline-block" }) || null;
}
function Heading(props) {
  let textSizeClass;
  if (props.type === "h1") {
    textSizeClass = "text-3xl";
  } else if (props.type === "h2") {
    textSizeClass = "text-2xl";
  } else if (props.type === "h3") {
    textSizeClass = "text-xl";
  } else if (props.type === "h4") {
    textSizeClass = "text-lg";
  } else if (props.type === "h6") {
    textSizeClass = "text-sm";
  } else {
    textSizeClass = "text-base";
  }
  return /* @__PURE__ */ jsx("h1", { className: `font-bold ${textSizeClass} dark:text-white`, children: props.children });
}
function Text(props) {
  return /* @__PURE__ */ jsx("p", { className: "text-base dark:text-white", children: props.children });
}
function Code(props) {
  return /* @__PURE__ */ jsx("pre", { className: "text-base dark:text-white", children: /* @__PURE__ */ jsx("code", { className: "text-base dark:text-white", children: props.children }) });
}
function Table(props) {
  return /* @__PURE__ */ jsxs("table", { className: "table-auto w-full", children: [
    /* @__PURE__ */ jsx("thead", { className: "border-b", children: /* @__PURE__ */ jsx("tr", { children: props.headers.map(
      (header) => {
        return /* @__PURE__ */ jsx(
          "th",
          {
            className: "text-left px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-white",
            children: header
          },
          header
        );
      }
    ) }) }),
    /* @__PURE__ */ jsx("tbody", { children: props.rows.map(
      (row) => {
        return /* @__PURE__ */ jsx("tr", { children: row.data.map(
          (cell) => {
            return /* @__PURE__ */ jsx(
              "td",
              {
                className: "border-t dark:border-gray-800 px-4 py-2 text-sm dark:text-white",
                children: cell
              }
            );
          }
        ) }, row.key);
      }
    ) })
  ] });
}
dayjs.extend(relativeTime);
const STAR_THRESHOLD = 30;
const MAX_REPOS = 5;
function ValueRow(props) {
  const { name, count, types, urls, values } = props;
  const [show, setShow] = useState(false);
  const urlNames = Object.fromEntries(urls.map((u) => [u, u.split("/").slice(3, 5).join("/")]));
  const shouldDrawArray = name.endsWith("[]");
  return /* @__PURE__ */ jsxs("div", { className: "max-w-md break-words", children: [
    /* @__PURE__ */ jsxs(
      "a",
      {
        className: "text-blue-500 hover:text-blue-700 hover:underline cursor-pointer",
        onClick: () => setShow(!show),
        children: [
          name,
          " (",
          count,
          ")"
        ]
      }
    ),
    show && values && /* @__PURE__ */ jsx(
      Table,
      {
        headers: ["Value", "Repo"],
        rows: values.map(([url, value]) => ({
          key: "show-values" + props.name + url,
          data: [
            /* @__PURE__ */ jsx("div", { className: "max-w-md break-words", children: value.map(
              (v) => [
                shouldDrawArray ? "- " + v : v,
                /* @__PURE__ */ jsx("br", {})
              ]
            ) }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
              "a",
              {
                href: url,
                target: "_blank",
                className: "text-blue-500 hover:text-blue-700 hover:underline cursor-pointer",
                children: urlNames[url]
              }
            ) })
          ]
        }))
      }
    )
  ] });
}
function HR(props) {
  const [pageData, setPageData] = useState(props.pageData);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    if (!pageData) {
      const file = props.keyFileMap[props.url];
      fetch(`./data-${file}.json`).then((res) => res.json()).then((data) => data[props.url]).then(setPageData);
    }
  }, [pageData, props.url]);
  if (!pageData && !(props.url in props.keyFileMap))
    return /* @__PURE__ */ jsxs("div", { children: [
      "Not found: ",
      props.url
    ] });
  if (!pageData)
    return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  const { name, doc, repos, icon, values: valueResult, helmRepoName, helmRepoURL } = pageData;
  const urlMap = valueResult.urlMap;
  const valueList = valueResult.list.map((v) => ({
    ...v,
    urls: v.urls.map((u) => urlMap[u])
  }));
  const valueMap = valueResult.valueMap;
  const docUrl = `https://github.com/whazor/k8s-at-home-search/new/main/?filename=web/src/info/${name}.md`;
  const needsFilter = repos.filter((rel) => rel.stars > STAR_THRESHOLD).length > MAX_REPOS;
  const top = repos.sort((a, b) => b.timestamp - a.timestamp).filter((rel) => rel.stars > STAR_THRESHOLD || !needsFilter).slice(0, MAX_REPOS);
  const repoCount = Math.min(showAll ? repos.length : MAX_REPOS, repos.length);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Heading, { type: "h1", children: [
      icon && /* @__PURE__ */ jsx(Icon, { icon }),
      " ",
      name,
      " helm"
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "mb-4 dark:text-slate-200",
        dangerouslySetInnerHTML: {
          __html: doc || `No introduction found. <a href="${docUrl}" target="_blank" class="text-blue-500 hover:text-blue-700 hover:underline">Create it?</a>`
        }
      }
    ),
    /* @__PURE__ */ jsx(Heading, { type: "h2", children: "Install" }),
    /* @__PURE__ */ jsx(Text, { children: "Install with:" }),
    /* @__PURE__ */ jsx(Code, { children: `helm repo add ${helmRepoName} ${helmRepoURL}
helm install ${name} ${helmRepoName}/${name} -f values.yaml` }),
    /* @__PURE__ */ jsxs(Heading, { type: "h2", children: [
      showAll ? "All" : "Top",
      " Repositories (",
      repoCount,
      " out of ",
      repos.length,
      ")"
    ] }),
    /* @__PURE__ */ jsx(Text, { children: "See examples from other people:" }),
    /* @__PURE__ */ jsx(
      Table,
      {
        headers: ["Name", "Repo", "Stars", "Version", "Timestamp"],
        rows: (!showAll ? top : repos).map((repo) => ({
          key: "examples" + repo.url,
          data: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: repo.url,
                target: "_blank",
                className: "text-blue-500 hover:text-blue-700 hover:underline cursor-pointer",
                children: [
                  repo.icon && /* @__PURE__ */ jsx(Icon, { icon: repo.icon }),
                  repo.name
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: repo.repo_url,
                target: "_blank",
                className: "text-blue-500 hover:text-blue-700 hover:underline cursor-pointer",
                children: repo.repo
              }
            ),
            repo.stars,
            repo.chart_version,
            dayjs.unix(repo.timestamp).fromNow()
          ]
        }))
      }
    ),
    !showAll && /* @__PURE__ */ jsxs(
      "button",
      {
        className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 mb-6",
        onClick: () => setShowAll(!showAll),
        children: [
          "See all ",
          repos.length,
          " releases"
        ]
      }
    ),
    /* @__PURE__ */ jsx(Heading, { type: "h2", children: "Values" }),
    /* @__PURE__ */ jsx(Text, { children: "See the most popular values for this chart:" }),
    /* @__PURE__ */ jsx(
      Table,
      {
        headers: ["Key", "Types"],
        rows: valueList.map(({ name: name2, count, types, urls }) => ({
          key: "popular-repos-values" + name2,
          data: [
            /* @__PURE__ */ jsx(
              ValueRow,
              {
                ...{ name: name2, count, types, urls },
                values: name2 in valueMap ? Object.entries(valueMap[name2]).map(([k, v]) => [urlMap[k], v]) : []
              }
            ),
            types.join(", ")
          ]
        }))
      }
    )
  ] });
}
function Home(props) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Heading, { type: "h2", children: "Popular releases" }),
    props.releases.sort((a, b) => b.count - a.count).filter((a) => a.count > 5).map(({ key, chart, icon, release }) => {
      return /* @__PURE__ */ jsxs("a", { href: `/k8s-at-home-search/hr/${key}`, className: " cursor-pointer text-lg rounded pb-0 pt-0 px-1 m-1 mb-0 inline-block ml-0 border-1 \n              dark:text-white dark:bg-gray-800 dark:border-gray-800 hover:bg-gray-200 hover:border-gray-200 dark:hover:bg-gray-700\n              ", children: [
        icon && /* @__PURE__ */ jsx(Icon, { icon }),
        " ",
        release
      ] }, "wordcloud-" + key);
    })
  ] });
}
const styles = '/*! tailwindcss v3.2.4 | MIT License | https://tailwindcss.com*/*,:after,:before{border:0 solid #e5e7eb;box-sizing:border-box}:after,:before{--tw-content:""}html{-webkit-text-size-adjust:100%;font-feature-settings:normal;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{line-height:inherit;margin:0}hr{border-top-width:1px;color:inherit;height:0}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-collapse:collapse;border-color:inherit;text-indent:0}button,input,optgroup,select,textarea{color:inherit;font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{color:#9ca3af;opacity:1}input::placeholder,textarea::placeholder{color:#9ca3af;opacity:1}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{height:auto;max-width:100%}[hidden]{display:none}*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.sr-only{clip:rect(0,0,0,0);border-width:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;white-space:nowrap;width:1px}.m-1{margin:.25rem}.m-2{margin:.5rem}.mb-4{margin-bottom:1rem}.mt-3{margin-top:.75rem}.mb-6{margin-bottom:1.5rem}.mb-0{margin-bottom:0}.ml-0{margin-left:0}.inline-block{display:inline-block}.inline{display:inline}.table{display:table}.max-h-0{max-height:0}.w-full{width:100%}.max-w-md{max-width:28rem}.table-auto{table-layout:auto}.cursor-pointer{cursor:pointer}.appearance-none{-webkit-appearance:none;-moz-appearance:none;appearance:none}.overflow-hidden{overflow:hidden}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.border-2{border-width:2px}.border-b{border-bottom-width:1px}.border-t{border-top-width:1px}.border-gray-200{--tw-border-opacity:1;border-color:rgb(229 231 235/var(--tw-border-opacity))}.bg-blue-500{--tw-bg-opacity:1;background-color:rgb(59 130 246/var(--tw-bg-opacity))}.bg-slate-50{--tw-bg-opacity:1;background-color:rgb(248 250 252/var(--tw-bg-opacity))}.p-4{padding:1rem}.py-2{padding-bottom:.5rem;padding-top:.5rem}.px-4{padding-left:1rem;padding-right:1rem}.px-1{padding-left:.25rem;padding-right:.25rem}.pt-2{padding-top:.5rem}.pb-0{padding-bottom:0}.pt-0{padding-top:0}.text-left{text-align:left}.align-middle{vertical-align:middle}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.uppercase{text-transform:uppercase}.leading-none{line-height:1}.leading-tight{line-height:1.25}.tracking-wider{letter-spacing:.05em}.text-blue-500{--tw-text-opacity:1;color:rgb(59 130 246/var(--tw-text-opacity))}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity))}.text-gray-700{--tw-text-opacity:1;color:rgb(55 65 81/var(--tw-text-opacity))}.text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128/var(--tw-text-opacity))}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition-\\[max-height\\]{transition-duration:.15s;transition-property:max-height;transition-timing-function:cubic-bezier(.4,0,.2,1)}.duration-300{transition-duration:.3s}.ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}.hover\\:border-gray-200:hover{--tw-border-opacity:1;border-color:rgb(229 231 235/var(--tw-border-opacity))}.hover\\:bg-blue-700:hover{--tw-bg-opacity:1;background-color:rgb(29 78 216/var(--tw-bg-opacity))}.hover\\:bg-gray-200:hover{--tw-bg-opacity:1;background-color:rgb(229 231 235/var(--tw-bg-opacity))}.hover\\:text-blue-700:hover{--tw-text-opacity:1;color:rgb(29 78 216/var(--tw-text-opacity))}.hover\\:underline:hover{text-decoration-line:underline}.focus\\:border-blue-500:focus{--tw-border-opacity:1;border-color:rgb(59 130 246/var(--tw-border-opacity))}.focus\\:bg-white:focus{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity))}.focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}@media (prefers-color-scheme:dark){.dark\\:border-gray-800{--tw-border-opacity:1;border-color:rgb(31 41 55/var(--tw-border-opacity))}.dark\\:border-gray-700{--tw-border-opacity:1;border-color:rgb(55 65 81/var(--tw-border-opacity))}.dark\\:bg-gray-900{--tw-bg-opacity:1;background-color:rgb(17 24 39/var(--tw-bg-opacity))}.dark\\:bg-gray-800{--tw-bg-opacity:1;background-color:rgb(31 41 55/var(--tw-bg-opacity))}.dark\\:bg-black{--tw-bg-opacity:1;background-color:rgb(0 0 0/var(--tw-bg-opacity))}.dark\\:text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity))}.dark\\:text-slate-200{--tw-text-opacity:1;color:rgb(226 232 240/var(--tw-text-opacity))}.dark\\:hover\\:bg-gray-700:hover{--tw-bg-opacity:1;background-color:rgb(55 65 81/var(--tw-bg-opacity))}.dark\\:focus\\:border-blue-500:focus{--tw-border-opacity:1;border-color:rgb(59 130 246/var(--tw-border-opacity))}.dark\\:focus\\:bg-gray-800:focus{--tw-bg-opacity:1;background-color:rgb(31 41 55/var(--tw-bg-opacity))}}';
function SearchBar(props) {
  const [search, setSearch] = useState("");
  const simplifyURL = (url) => {
    let domain = url.replace(/https?:\/\//, "").split("/")[0];
    domain = domain.split(".").slice(0, -1).join(".");
    domain = domain.replace(/^charts\./, "");
    domain = domain.replace(/^www\./, "");
    domain = domain.replace(/\.github$/, "");
    return domain;
  };
  const fullHeight = "max-h-128";
  const peerFullHeight = "peer-focus:max-h-128";
  const searches = props.releases.filter((_) => search.length > 0).filter(({ chart, release, chartsUrl }) => {
    return chart.toLowerCase().includes(search.toLowerCase()) || release.toLowerCase().includes(search.toLowerCase()) || simplifyURL(chartsUrl).toLowerCase().includes(search.toLowerCase());
  });
  return /* @__PURE__ */ jsxs("label", { children: [
    /* @__PURE__ */ jsx("span", { className: "sr-only dark:text-white", children: "Search for a chart:" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        className: "peer bg-slate-50 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 dark:bg-black dark:text-white dark:border-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-500",
        type: "text",
        placeholder: "Search for a chart...",
        value: search,
        onChange: (e) => {
          setSearch(e.target.value);
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: `${search === "" ? "max-h-0" : fullHeight} overflow-hidden ease-in-out duration-300 transition-[max-height] ${peerFullHeight}`, children: search !== "" && /* @__PURE__ */ jsxs("table", { className: "w-full m-2 dark:text-white", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left", children: "Release" }),
        /* @__PURE__ */ jsx("th", { className: "text-left", children: "Chart" }),
        /* @__PURE__ */ jsx("th", { className: "text-left", children: "Count" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: searches.map(({ key, chart, release, chartsUrl, count }) => {
        return /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", { href: `/k8s-at-home-search/hr/${key}`, children: release }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", { href: `/k8s-at-home-search/hr/${key}`, children: simplifyURL(chartsUrl) + "/" + chart }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", { href: `/k8s-at-home-search/hr/${key}`, children: count }) })
        ] }, "hr-release" + key);
      }) })
    ] }) })
  ] });
}
function denormalize(appData) {
  return {
    releases: appData.releases.map(
      ([release, chart, name, key, chartsUrl, count, icon]) => ({
        release,
        chart,
        name,
        key,
        chartsUrl: appData.chartURLs[chartsUrl],
        count,
        icon
      })
    )
  };
}
function App(props) {
  const { pageData } = props;
  const releases = denormalize(props).releases;
  return /* @__PURE__ */ jsxs("div", { className: "p-4 dark:bg-gray-900", children: [
    /* @__PURE__ */ jsx("style", { children: styles }),
    /* @__PURE__ */ jsxs("nav", { children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/k8s-at-home-search/",
          children: /* @__PURE__ */ jsx("h1", { className: "text-3xl dark:text-white", children: "k8s at home search" })
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-lg dark:text-white", children: "Search for a helm release" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(SearchBar, { releases }) }),
      /* @__PURE__ */ jsxs(Routes, { children: [
        /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Home, { releases }) }, "/"),
        releases.map(({ key, chart, release }) => {
          return /* @__PURE__ */ jsx(
            Route,
            {
              path: `/hr/${key}`,
              element: /* @__PURE__ */ jsx(
                HR,
                {
                  ...{ chart, release },
                  url: "/hr/" + key,
                  pageData,
                  keyFileMap: props.keyFileMap
                }
              )
            },
            "hr-" + key
          );
        })
      ] })
    ] })
  ] });
}
function render(url, appData, pageData) {
  return ReactDOMServer.renderToString(
    /* @__PURE__ */ jsx(StaticRouter, { location: url, basename: "/k8s-at-home-search/", children: /* @__PURE__ */ jsx(App, { ...appData, pageData }) })
  );
}
export {
  render
};
