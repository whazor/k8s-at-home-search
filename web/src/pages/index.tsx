import { useMemo, useState } from "react";
import Icon from "../components/icon"

type Release = {
  key: string,
  chart: string,
  release: string,
  count: number,
  icon?: string,
  group?: string
}

const normalizeGroup = (group: string) => {
  group = group.toLocaleLowerCase();
  group = group.replaceAll("home automation", "home");
  if(group === "internal" || group === "external") {
    group = "";
  }
  return group;
}
export default function Home(props: {releases: Release[]}) {
    const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
    const groupedReleases = useMemo(() => 
      props.releases.filter(r => r.group) as (Release&{group: string})[]
    , [props.releases]);

    const groups = useMemo(() =>
      new Set(groupedReleases.map(r => normalizeGroup(r.group)))
    , [groupedReleases]);
    const groupMap = useMemo(() => 
      groupedReleases.reduce((map, r) => {
        const group = normalizeGroup(r.group);
        if (!map[group]) {
          map[group] = [];
        }
        map[group].push(r);
        return map;
      }, {} as Record<string, Release[]>)
    , [groupedReleases]);

    return (
      <>
        <div className="flex flex-wrap gap-2 mb-2 items-center">
        <h2>Popular releases</h2>
        <div>
        {[...groups].filter(Boolean)
        .filter(group => 
          groupMap[group].reduce((a, b) => a + b.count, 0) > 5 &&
          groupMap[group].length > 3
        )
        .sort((a, b) => groupMap[b].length - groupMap[a].length)
        .map((group, i) => {
          return <button key={group} 
          onClick={() => 
            setSelectedGroup(group === selectedGroup ? undefined : group)
          }
          className={
            "mr-1 cursor-pointer inline-flex items-center rounded-md bg-blue-50 px-1 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 lowercase "+
            (selectedGroup === group ? " bg-blue-300 text-blue-900" : "")
          }>
        {group}
      </button>
        })}
        </div>
        </div>

        {
        (selectedGroup ? groupMap[selectedGroup] : props.releases)
        .sort((a, b) => b.count - a.count).filter(a => a.count > 5).map(({key, chart, group, icon, release}) => {
          return (
            <a href={`/hr/${key}`} tabIndex={-1}
              key={'wordcloud-' + key} className="
              text-slate-900 hover:text-slate-900 no-underline
              dark:text-gray-300 dark:hover:text-white
              cursor-pointer text-lg rounded pb-0 pt-0 px-1 m-1 mb-0 inline-block ml-0 border
              border-slate-200 hover:border-gray-200 hover:bg-gray-200 
              dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700
              ">
                {icon && <Icon icon={icon} />}

                {release}
              </a>
          )
        })}
      </>
    )
  }