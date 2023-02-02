import Icon from "../components/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import Text from "../components/text";
import Code from "../components/code";
import Table from "../components/table";
import type { PageData, RepoAlsoHas } from "../generators/helm-release/models";

dayjs.extend(relativeTime);

interface HRProps {
  release: string;
  url: string;
  chart: string;

  pageData?: PageData;
  keyFileMap: Record<string, number>;
  repoAlsoHas: RepoAlsoHas;
}

const STAR_THRESHOLD = 30;
const MAX_REPOS = 5;

function ValueRow(props: {
  name: string;
  count: number;
  types: string[];
  urls: string[];
  values?: [string, any][];
}) {
  const { name, count, types, urls, values } = props;
  const [show, setShow] = useState(false);
  const urlNames = Object.fromEntries(
    urls.map((u) => [u, u.split("/").slice(3, 5).join("/")])
  );
  const shouldDrawArray = name.endsWith("[]");
  return (
    <div className="max-w-md break-words">
      <a onClick={() => setShow(!show)}>
        {name} ({count})
      </a>
      {show && values && (
        <Table
          headers={["Value", "Repo"]}
          rows={values.map(([url, value]) => ({
            key: "show-values" + props.name + url,
            data: [
              <div className="max-w-md break-words">
                {value.map((v: any) => [
                  shouldDrawArray ? "- " + v : v,
                  <br />,
                ])}
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

  if (Object.keys(alsoHas).length == 0) return null;

  return (
    <div>
      <label className="text-sm mr-1">Filter repos who also have:</label>
      {[...filters].map((name) => (
        <label key={name} className="mr-1">
          <input
            type="checkbox"
            onChange={(e) => {
              const newSet = new Set(filters);
              newSet.delete(name);
              setFilters(newSet, selectRepos(newSet));
            }}
            checked={filters.has(name)}
          />
          {name}
        </label>
      ))}
      {Object.keys(alsoHas).filter((n) => !filters.has(n)).length > 0 && (
        <select
          className="border"
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
  const [pageData, setPageData] = useState(props.pageData);
  const [showAll, setShowAll] = useState(false);
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
        });
    }
  }, [pageData, props.url]);
  useEffect(() => {
    setFilteredRepos(props.pageData?.repos || []);
  }, [props.pageData]);

  if (!pageData && !(props.url in props.keyFileMap))
    return <div>Not found: {props.url}</div>;

  if (!pageData) return <div>Loading...</div>;

  const {
    name,
    repos,
    icon,
    values: valueResult,
    chartName,
    helmRepoName,
    helmRepoURL,
  } = pageData;

  const urlMap = valueResult.urlMap;
  const valueList = valueResult.list.map((v) => ({
    ...v,
    urls: v.urls.map((u) => urlMap[u]),
  }));
  const valueMap = valueResult.valueMap;

  const docUrl = `https://github.com/whazor/k8s-at-home-search/new/main/?filename=web/src/info/${name}.md`;
  const doc =
    pageData.doc ||
    `No introduction found. <a href="${docUrl}" target="_blank">Create it?</a>`;
  const needsFilter =
    repos.filter((rel) => rel.stars > STAR_THRESHOLD).length > MAX_REPOS;

  // sort by timestamp
  const top = repos
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((rel) => rel.stars > STAR_THRESHOLD || !needsFilter)
    .slice(0, MAX_REPOS);

  const filtered = !showAll && filters.size == 0 ? top : filteredRepos;

  const repoCount = filtered.length;
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
      <h3>Install</h3>
      <Text>Install with:</Text>
      <Code>
        {`helm repo add ${helmRepoName} ${helmRepoURL}
helm install ${name} ${helmRepoName}/${chartName} -f values.yaml`}
      </Code>
      <h3>
        {showAll ? (filters.size > 0 ? "Filtered" : "All") : "Top"} Repositories
        ({repoCount} out of {repos.length})
      </h3>
      <Text>See examples from other people.</Text>
      <FilterRepos
        repoAlsoHas={props.repoAlsoHas}
        repos={props.pageData!.repos || []}
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
              {repo.icon && <Icon icon={repo.icon} />}
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
      {!showAll && filters.size === 0 && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 mb-6"
          onClick={() => setShowAll(!showAll)}
        >
          See all {repos.length} releases
        </button>
      )}
      <h3>Values</h3>
      <Text>See the most popular values for this chart:</Text>
      <Table
        headers={["Key", "Types"]}
        rows={valueList.map(({ name, count, types, urls }) => ({
          key: "popular-repos-values" + name,
          data: [
            <ValueRow
              {...{ name, count, types, urls }}
              key={"value-row" + name}
              values={
                name in valueMap
                  ? (
                      Object.entries(valueMap[name]) as unknown as [
                        number,
                        any
                      ][]
                    ).map(([k, v]) => [urlMap[k], v])
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
