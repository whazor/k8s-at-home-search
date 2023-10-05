import Icon from "../components/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useMemo, useState } from "react";
import Text from "../components/text";
import Code from "../components/code";
import Table from "../components/table";
import type { PageData, ReleaseInfo, RepoAlsoHas } from "../generators/helm-release/models";
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
          className="border bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
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
      )}
    </div>
  );
}



export default function HR(props: HRProps) {
  const [repos, setRepos] = useState<PageData["repos"]>(props.pageData?.repos || []);
    // top repos are filtered by the STAR_THRESHOLD and sorted latest first
  const top = useMemo(() => {
    return repos
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter((rel) => rel.stars > STAR_THRESHOLD )
      .slice(0, MAX_REPOS);
  }, [repos]);

  const [showAll, setShowAll] = useState(false);
    // if there are too little top repos, we show all
  // or when there are too little repos in total (we don't want to say Top)
  useEffect(() => {
    if(top.length < 2 || repos.length <= MAX_REPOS) {
      setShowAll(true);
    }
  }, [top.length, repos.length])

  const [pageData, setPageData] = useState(props.pageData);
  
  const [filters, setFilters] = useState(new Set<string>());
  const [filteredRepos, setFilteredRepos] = useState(
    props.pageData?.repos || []
  );

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
      if(!pageData) return undefined;
      const p = props.releases.reduce((acc, r) => {
        if(r.name != pageData.name) return acc;
        if(r.count > acc[2]) {
          return [r.key, r.chartsUrl, r.count] as [string, string, number];
        }
        return acc;
      }, [pageData.key, pageData.helmRepoURL, pageData.repos.length] as [string,string, number]) ;
      if(p[0] !== pageData.key) {
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
      return '"' + x.replaceAll('#', '.') +'"';
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
      <h3>
        {filterName} Repositories
        ({repoCount} out of {repos.length})
      </h3>
      <Text>See examples from other people.</Text>
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
          dark:bg-blue-700 dark:hover:bg-blue-500 dark:text-gray-300
           font-bold py-2 px-4 rounded mt-3 mb-6"
          onClick={() => setShowAll(true)}
        >
          See all {repos.length} releases
        </button>
      ) : <></>}
      <h3>{ filters.size > 0 && "Filtered "}Values</h3>
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
                {...{ name, types, urls}}
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
