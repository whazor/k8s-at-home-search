import type { RepoPageData } from "../generators/helm-release/models";
import Table from "../components/table";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import Icon from "../components/icon";
dayjs.extend(relativeTime);


export function Repo(props: RepoPageData) {
    return <div>
        <h2>Helm Releases from {props.name}</h2>
        <Table
            headers={["Release", "Chart", "Last update", "Version"]}
            rows={props.releases.sort((a, b) => a.timestamp - b.timestamp).reverse().map((release) => ({
                key: "examples" + release.chart + release.name,
                data: [
                    <a href={release.url} target={"_blank"}>
                        <Icon icon={release.icon} />
                        {release.name}
                    </a>,
                    release.chart,
                    dayjs.unix(release.timestamp).fromNow(),
                    release.version,
                ]

            }))}
        />
                
    </div>;
}