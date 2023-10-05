import Table from "../components/table";


export function Top(props: any) {
    const {interestingIdToName, repoAlsoHasMap} = props.repoAlsoHas;

    return <div>
        <h2>Top Repositories</h2>
        <Table
            headers={["# of Helm releases", "Repo", "Stars", "Highlights"]}
            rows={props.repos.map((repo: any) => ({
                key: "top" + repo.url,
                data: [
                    <a href={'/repo/'+repo.name}>{repo.count}</a>,
                    <a href={repo.url} target={"_blank"}>
                        {repo.name}
                    </a>,
                    repo.stars,
                    <div>
                    {(repoAlsoHasMap?.[repo.name] || []).sort().map((id: any) => (
                        <span key={repo.url+'-intr-'+id} className="px-1 py-0.5 rounded bg-gray-200 text-gray-800 text-xs mr-1">
                                {interestingIdToName[id]}
                        </span>
                    ))}
                    </div>
                ]
            }))}
        />
    </div>;
}