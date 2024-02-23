import Icon from "../components/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useMemo, useState } from "react";
import Text from "../components/text";
import Code from "../components/code";
import Table from "../components/table";
import { MINIMUM_COUNT, ValuesData, type PageData, type ReleaseInfo, type RepoAlsoHas } from "../generators/helm-release/models";
import { modeCount, simplifyURL } from "../utils";

dayjs.extend(relativeTime);

interface HRProps {
  release: string;
  url: string;
  chart: string;

  pageData?: PageData;
  keyFileMap: Record<string, number>;
  repoAlsoHas: RepoAlsoHas;
  releases: ReleaseInfo[]
}

const STAR_THRESHOLD = 30;
const MAX_REPOS = 5;

function ValueRow(props: {
  name: string;
  showMin: boolean;
  urls: string[];
  values?: [string, any][];
}) {
  const { name, urls, values } = props;
  const [show, setShow] = useState(false);
  const urlNames = Object.fromEntries(
    urls.map((u) => [u, u.split("/").slice(3, 5).join("/")])
  );
  const shouldDrawArray = name.endsWith("[]");
  const valueToText = (key: string, value: string[]) => {
    return <span>{value.map((v: any, i) =>
      <span key={key + i}>
        {shouldDrawArray ? "- " + (
          v.match(/^[0-9]/) ? '"' + v + '"' : v
        ) : v}
        <br />
      </span>
    )}</span>
  }
  const [valueMode, valueCount] = modeCount(values?.map(v => v[1]) || [])
  return (
    <div className="w-96 lg:w-[900px] m-h-[150px] overflow-auto">
      <a onClick={() => setShow(!show)} title={`List all values from ${name}`}>
        {name} ({values?.length || 0})
      </a>
      {(valueCount >= 3 || props.showMin) && <div>
        <code className="text-xs">{valueToText("show-values" + props.name, valueMode)}</code>
      </div>}
      {show && values && (
        <Table
          headers={["Value", "Repo"]}
          rows={values.map(([url, value]) => ({
            key: "show-values" + props.name + url,
            data: [
              <div>
                <code className="text-sm">{valueToText("show-values" + props.name + url, value)}</code>
              </div>,
              <div>
                <a href={url} target="_blank">
                  {urlNames[url]}
                </a>
              </div>,
            ],
          }))}
        />
      )}
    </div>
  );
}

const MAJOR_VERSION_REGEX = /^v?(\d+)/;

function FilterMajorVersions(props: {
  repos: PageData["repos"];
  filteredRepos: PageData["repos"];
  version: string | undefined;
  setVersion: (v: string | undefined, repos: PageData["repos"]) => void;
}) {

  const majorVersions = useMemo(() => [...new Set(props.repos.map(r =>
    (r.chart_version || "").match(MAJOR_VERSION_REGEX)?.[1]
  ))], [props.repos]);

  const chooseVersion = (v: string) => {
    const repos = !!v && v !== "All" ? props.repos.filter(r => (r.chart_version || "").match(MAJOR_VERSION_REGEX)?.[1] == v) : props.repos;
    props.setVersion(v, repos);
  };

  useEffect(() => {
    // select the latest major version
    const versions = majorVersions.map(v => parseInt(v || "0", 10))
      .filter(v => v > 0)
      .sort((a, b) => b - a).map(v => v.toString());
    if (versions.length > 0 && !props.version) {
      chooseVersion(versions[0]);
    }
  }, [majorVersions]);

  return <div>
    <label className="text-sm mr-1 dark:text-gray-300"
    >Major version:</label>
    <select
      className="border bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
      value={props.version}
      onChange={
        e => {

          const v = e.target.value;
          chooseVersion(v);
        }
      }
    >
      <option>All</option>
      {majorVersions.map((v) => (
        <option key={"select" + v}>
          {v}
        </option>
      ))}
    </select>

  </div>
}


function FilterRepos(props: {
  repoAlsoHas: RepoAlsoHas;
  repos: PageData["repos"];
  filteredRepos: PageData["repos"];
  filters: Set<string>;
  setFilters: (f: Set<string>, repos: PageData["repos"]) => void;
}) {
  const { filters, setFilters, filteredRepos } = props;
  const repoSet = new Set(props.repos.map((r) => r.repo));
  const alsoHas = Object.fromEntries(
    Object.entries(props.repoAlsoHas.interestingIdToName).map(([id, name]) => [
      name,
      Object.entries(props.repoAlsoHas.repoAlsoHasMap)
        .filter(
          ([repo, id2]) => repoSet.has(repo) && id2.includes(parseInt(id))
        )
        .map(([repo, _]) => repo),
    ])
  );

  const selectRepos = (filters: Set<string>) =>
    Object.entries(alsoHas)
      .filter(([name]) => filters.has(name))
      .map(([, repos]) => repos)
      .reduce((acc, r) => {
        const setR = new Set(r);
        return acc.filter((r) => setR.has(r.repo));
      }, props.repos);

  const selectedRepoSet = new Set(filteredRepos.map((r) => r.repo));
  const alsoHasFiltered = Object.fromEntries(
    Object.entries(alsoHas).map(([name, repos]) => [
      name,
      repos.filter((r) => selectedRepoSet.has(r)),
    ])
  );

  if (Object.values(alsoHas).every(l => l.length == 0))
    return null;

  return (
    <div>
      <label className="text-sm mr-1 dark:text-gray-300
      ">Filter repos who also have:</label>
      {[...filters].map((name) => (
        <label key={name} className="mr-1 dark:text-gray-300">
          <input
            type="checkbox"
            onChange={(e) => {
              const newSet = new Set(filters);
              newSet.delete(name);
              setFilters(newSet, selectRepos(newSet));
            }}
            checked={filters.has(name)}
            className="mr-1"
          />
          {name}
        </label>
      ))}
      {Object.keys(alsoHas).filter((n) => !filters.has(n)).length > 0 && (
        <select
          className="border bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          onChange={(e) => {
            const name = e.target.value;
            const newSet = new Set(filters);
            newSet.add(name);
            setFilters(newSet, selectRepos(newSet));
          }}
        >
          <option></option>
          {Object.keys(alsoHas)
            .filter((n) => !filters.has(n))
            .map((name) => (
              <option
                key={"select" + name}
                value={name}
                disabled={alsoHasFiltered[name].length == 0}
              >
                {name} ({alsoHasFiltered[name].length})
              </option>
            ))}
        </select>
      )
      }

    </div >
  );
}

const MB_REGEXP = /(\d+)(mi?)/i;
const GB_REGEXP = /(\d+)(gi?)/i;

const convertToBytes = (size: string) => {
  let res;
  if (res = MB_REGEXP.exec(size)) {
    return parseInt(res[1]);
  }
  if (res = GB_REGEXP.exec(size)) {
    return parseInt(res[1]) * 1024;
  }
  console.error("unknown memory size", size)
  return -1;
}
function sort(i: Array<number>): Array<number> {
  return i.sort((a, b) => a - b);
}

const CPU_REGEXP = /(\d+)m/i;

const convertToCPU = (size: string) => {
  let res;
  if (res = CPU_REGEXP.exec(size)) {
    return parseInt(res[1]);
  }
  if (res = /\d+/.exec(size)) {
    return parseInt(res[1]) * 1000;
  }
  console.error("unknown cpu size", size)
  return -1;
}

// TODO: replace with d3
function GroupResources({ data, suffix, label }: { data: number[], suffix: string, label: string }) {
  if (data.length < 5) {
    return <></>;
  }
  const numMap = Object.entries(data.reduce(
    (obj, x) => ({
      ...obj,
      [x]: x in obj ? obj[x] + 1 : 1
    }), {} as Record<number, number>
  ));
  const mostPopular = numMap.map(x => x[1]).reduce((a, b) => Math.max(a, b), 0);

  return <div>
    <label>{label}</label>
    <div className="flex gap-x-1">
      {numMap.map(([x, amount]) =>
        <a key={label + x} className="inline-block border no-underline px-1 cursor-pointer" style={{
          borderColor: `rgba(255, 255, 255, ${Math.max(amount / mostPopular, 0.1)})`,
          borderStyle: ''
        }} title={`used ${amount} times`} onClick={
          ev => {
            // TODO: show notification
            navigator.clipboard.writeText(
              `${x}${suffix}`
            )
            const link = ev.target as HTMLElement;
            link.className = link.className + " animate-bounce";
            setTimeout(() => {
              link.className = link.className.replace("animate-bounce", "");
            }, 500)
          }
        }>
          {x}{suffix}
        </a>)}
    </div></div>;
}


function Resources({ values }: { values: ValuesData }) {
  const {
    valueMap
  } = values;

  const mapToValue = (names: string[]) => {
    for (let name of names) {
      if (name in valueMap) {
        return Object.values(valueMap[name]).map(x => x[0]) as string[];
      }
    }
    return [];
  };
  const mapBytes = (names: string[]) => sort(
    mapToValue(names).map(x => convertToBytes(x))
  );
  const mapCPU = (names: string[]) => sort(
    mapToValue(names).map(x => convertToCPU(x))
  )

  const expand = (name: string) => [
    `controllers.main.containers.main.resources.${name}`,
    `resources.${name}`,
  ]

  const memoryRequest = mapBytes(expand(
    "requests.memory"
  ));
  const memoryLimit = mapBytes(expand("limits.memory"));
  const cpuRequest = mapCPU(expand("requests.cpu"));
  const cpuLimit = mapCPU(expand("limits.cpu"));

  if (Math.max(memoryRequest.length, memoryLimit.length, cpuRequest.length, cpuLimit.length) < 5) {
    return <></>;
  }

  return <div className="text-white">
    <h3>Resources</h3>
    <GroupResources data={memoryRequest} label="Memory request" suffix="Mi" />
    <GroupResources data={memoryLimit} label="Memory limit" suffix="Mi" />
    <GroupResources data={cpuRequest} label="CPU Request" suffix="m" />
    <GroupResources data={cpuLimit} label="CPU Limit" suffix="m" />

  </div>
}


export default function HR(props: HRProps) {
  const [repos, setRepos] = useState<PageData["repos"]>(props.pageData?.repos || []);
  // top repos are filtered by the STAR_THRESHOLD and sorted latest first
  const top = useMemo(() => {
    return repos
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter((rel) => rel.stars > STAR_THRESHOLD)
      .slice(0, MAX_REPOS);
  }, [repos]);

  const [showAll, setShowAll] = useState(false);
  // if there are too little top repos, we show all
  // or when there are too little repos in total (we don't want to say Top)
  useEffect(() => {
    if (top.length < 2 || repos.length <= MAX_REPOS) {
      setShowAll(true);
    }
  }, [top.length, repos.length])

  const [pageData, setPageData] = useState(props.pageData);

  const [filters, setFilters] = useState(new Set<string>());
  const [filteredRepos, setFilteredRepos] = useState(
    props.pageData?.repos || []
  );

  const [majorVersion, setMajorVersion] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!pageData) {
      const file = props.keyFileMap[props.url];
      fetch(`./data-${file}.json`)
        .then((res) => res.json())
        .then((data: any) => {
          setPageData(data[props.url] as PageData);
          setRepos(data[props.url].repos || []);
          setFilteredRepos(data[props.url].repos || []);
        });
    }
  }, [pageData, props.url]);

  const morePopular = useMemo(
    () => {
      if (!pageData) return undefined;
      const p = props.releases.reduce((acc, r) => {
        if (r.name != pageData.name) return acc;
        if (r.count > acc[2] && r.count > MINIMUM_COUNT) {
          return [r.key, r.chartsUrl, r.count] as [string, string, number];
        }
        return acc;
      }, [pageData.key, pageData.helmRepoURL, pageData.repos.length] as [string, string, number]);
      if (p[0] !== pageData.key) {
        return p;
      } else return undefined;
    }, [props.releases, pageData]
  )

  if (!pageData && !(props.url in props.keyFileMap))
    return <div>Not found: {props.url}</div>;

  if (!pageData) return <div>Loading...</div>;


  const {
    name,
    icon,
    values: valueResult,
    chartName,
    helmRepoName,
    helmRepoURL,
  } = pageData;

  const urlMap = valueResult.urlMap;
  const valueList = valueResult.list.map((v) => ({
    ...v,
    key: v.name,
    name: v.name.replaceAll(/(([a-zA-Z0-9_\-\/]*#)+[a-zA-Z0-9_\-\/]*)/g, x => {
      return '"' + x.replaceAll('#', '.') + '"';
    }),
    urls: v.urls.map((u) => urlMap[u]),
  }));
  const valueMap = valueResult.valueMap;

  const docUrl = `https://github.com/whazor/k8s-at-home-search/new/main/?filename=web/src/info/${name}.md`;
  const doc =
    pageData.doc ||
    `No introduction found. <a href="${docUrl}" target="_blank">Create it?</a>`;




  // with filters we always show all
  const filtered = !showAll && filters.size == 0 ? top : filteredRepos;
  const filteredUrls = new Set(filteredRepos.map((r) => r.url));
  const repoCount = filtered.length;

  const filterName = showAll ? (filters.size > 0 ? "Filtered" : "All") : "Top"
  const seeAllBtnEnabled = !showAll && filters.size === 0;
  return (
    <>
      <h2>
        {icon && <Icon icon={icon} />} {name} helm
      </h2>
      <div className="prose dark:prose-invert">
        <p
          dangerouslySetInnerHTML={{
            __html: doc,
          }}
        />
      </div>
      {morePopular && (
        // make warning/alert
        <div className="my-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4
        dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300
        ">
          <h3>More popular helm chart found</h3>
          <p>
            <a href={`/hr/${morePopular[0]}`}>{name}</a> from {simplifyURL(morePopular[1])} is more popular with {morePopular[2]} repositories.
          </p>
        </div>
      )}

      <h3>Install</h3>
      <Text>Install with:</Text>
      <Code>
        {`helm repo add ${helmRepoName} ${helmRepoURL}
helm install ${name} ${helmRepoName}/${chartName} -f values.yaml`}
      </Code>


      <h3>Examples</h3>
      <Text>See examples from other people.</Text>
      <div className="flex flex-col lg:flex-row lg:space-x-2 space-y-2 lg:space-y-0">
        <FilterMajorVersions
          repos={props.pageData?.repos || []}
          filteredRepos={filteredRepos}
          version={majorVersion}
          setVersion={(v, repos) => {
            setRepos(repos);
            setFilteredRepos(repos);
            setMajorVersion(v);
            //setShowAll(true);
          }} />
        <FilterRepos
          repoAlsoHas={props.repoAlsoHas}
          repos={props.pageData?.repos || []}
          filteredRepos={filteredRepos}
          filters={filters}
          setFilters={(f, r) => {
            setFilters(f);
            setFilteredRepos(r);
            setShowAll(true);
          }}
        />
      </div>
      <h4>
        {filterName} Repositories
        ({repoCount} out of {repos.length})
      </h4>
      <Table
        headers={["Name", "Repo", "Stars", "Version", "Timestamp"]}
        rows={filtered.map((repo) => ({
          key: "examples" + repo.url,
          data: [
            <a href={repo.url} target={"_blank"}>
              <Icon icon={repo.icon} />
              {repo.name}
            </a>,
            <a href={repo.repo_url} target={"_blank"}>
              {repo.repo}
            </a>,
            repo.stars,
            repo.chart_version,
            dayjs.unix(repo.timestamp).fromNow(),
          ],
        }))}
      />
      {seeAllBtnEnabled ? (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white
          dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
            py-1 px-1 rounded mt-3 mb-3 text-sm"
          onClick={() => setShowAll(true)}
        >
          See all {repos.length} releases
        </button>
      ) : <></>}

      <Resources values={valueResult} />
      <h4>{filters.size > 0 && "Filtered "}Values</h4>
      <Text>See the most popular values for this chart:</Text>
      <Table
        headers={["Key", "Types"]}
        rows={
          valueList
            .filter(v => v.urls.some(u => filteredUrls.has(u)))
            .map(({ key, name, types, urls }) => ({
              key: "popular-repos-values" + key,
              data: [
                <ValueRow
                  {...{ name, types, urls }}
                  key={"value-row" + key}
                  showMin={repoCount <= 3}
                  values={
                    key in valueMap
                      ? ((
                        Object.entries(valueMap[key]) as unknown as [
                          number,
                          any
                        ][]
                      ).filter(([u,]) => filteredUrls.has(urlMap[u])).map(([k, v]) => [urlMap[k], v]))

                      : []
                  }
                />,
                types.join(", "),
              ],
            }))}
      />
    </>
  );
}
