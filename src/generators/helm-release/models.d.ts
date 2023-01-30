export type ReleaseInfoCompressed = [
    string,
    string,
    string,
    string,
    number,
    number,
    // count,
    string | undefined
];
export interface AppData {
    chartURLs: string[];
    releases: ReleaseInfoCompressed[];
    keyFileMap: Record<string, number>;
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
export declare function denormalize(appData: AppData): {
    releases: ReleaseInfo[];
};
export interface ValueTree {
    [key: string]: ValueTree | string;
}
export interface RepoInfo {
    name: string;
    repo: string;
    helm_repo_name: string;
    helm_repo_url: string;
    url: string;
    repo_url: string;
    chart_version: string;
    stars: number;
    icon: string;
    timestamp: number;
}
export interface CollectorData {
    releases: ReleaseInfo[];
    keys: string[];
    count: Record<string, number>;
    repos: Record<string, RepoInfo[]>;
    values: Record<string, ValueTree>;
}
export type ValueList = {
    name: string;
    count: number;
    types: string[];
    urls: number[];
}[];
export interface ValuesData {
    list: ValueList;
    urlMap: Record<number, string>;
    valueMap: Record<string, Record<number, any[]>>;
}
export interface PageData {
    key: string;
    title: string;
    name: string;
    doc?: string;
    icon?: string;
    helmRepoName?: string;
    helmRepoURL?: string;
    values: ValuesData;
    repos: RepoInfo[];
}
export declare const MINIMUM_COUNT = 3;
//# sourceMappingURL=models.d.ts.map