
export type ReleaseInfoCompressed = [
    string, // release
    string, // chart
    string, // name
    string, // key
    number, // chartsUrl
    number, // count,
    string|undefined, // icon
]

export interface RepoAlsoHas {
    interestingIdToName: Record<number, string>
    repoAlsoHasMap: Record<string, number[]>
}
export interface AppData {
    chartURLs: string[];
    releases: ReleaseInfoCompressed[],
    keyFileMap: Record<string, number>,
    repoAlsoHas: RepoAlsoHas
}
export interface ReleaseInfo {
    release: string;
    chart: string;
    name: string;
    key: string;
    chartsUrl: string;
    count: number;
    icon?: string;
}

export function denormalize(
    appData: AppData,
    ): {
        releases: ReleaseInfo[],
    } {
    return {
        releases: appData.releases.map(
            ([release, chart, name, key, chartsUrl, count, icon]) => ({
                release,
                chart,
                name,
                key,
                chartsUrl: appData.chartURLs[chartsUrl],
                count,
                icon,
            })
        ),
    }
}

export interface ValueTree {
    [key: string]: ValueTree | string;
}


export interface RepoInfo {
    name: string,
    repo: string,
    helm_repo_name: string,
    helm_repo_url: string,
    url: string,
    repo_url: string,
    chart_version: string,
    stars: number,
    icon: string,
    timestamp: number,
}

export interface CollectorData {
    releases: ReleaseInfo[];
    keys: string[];
    count: Record<string, number>;
    repos: Record<string, RepoInfo[]>;
    values: Record<string, ValueTree>;
}

export type ValueList = {
    name: string,
    count: number,
    types: string[],
    urls: number[]
}[];

export interface ValuesData {
    list: ValueList,
    urlMap: Record<number, string>,
    valueMap: Record<string, Record<number, any[]>>
}

export interface PageData {
    key: string;
    title: string;
    name: string;
    chartName: string;
    doc?: string;
    icon?: string;
    helmRepoName?: string,
    helmRepoURL?: string,
    values: ValuesData,
    repos: RepoInfo[];
}

export const MINIMUM_COUNT = 3;
