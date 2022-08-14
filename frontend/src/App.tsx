import React, { useEffect, useState } from "react";
import { BaseLocationHook, Link, Route, Switch, Router, useRoute } from "wouter";
import { WordCloudView } from "./components/word_cloud";
import { SearchView } from "./components/search";
import { TopReposView } from "./components/top_repos";
import { ChartView } from "./components/chart";
import { dataProgressSubject } from "./db/queries";
import { useObservableState, useSubscription } from "observable-hooks";
import { map } from "rxjs/operators";
import GitHubButton from 'react-github-btn';
import { GrafanaDashboardsView } from "./components/grafana";

function Body(props: { children: React.ReactNode, }) {
  const [, params] = useRoute<{ search: string }>("/:search+");
  const [hasSlash, addSlash] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // p.contentLength p.received
  const [res] = useObservableState(() => dataProgressSubject.pipe(
    // calculate percentage as number
    map(p => Math.round((p.received / p.contentLength) * 100)),
  ), 0);
  const [res2] = useObservableState(() => dataProgressSubject.pipe(
    map(p => ({
      received: Math.round(p.received / 1000),
      contentLength: Math.round(p.contentLength / 1000),
    })),
  ), {
    contentLength: 0,
    received: 0,
  });
  useSubscription(dataProgressSubject, null, null, () => {
    setLoaded(true);
  });
  return <div className="md:w-11/12 lg:w-10/12 md:mt-8 mx-auto rounded-xl shadow-lg md:p-5 pt-0 dark:bg-gray-400 dark:slate-50">
    <div className="float-right p-4 pt-0">
      <GitHubButton href="https://github.com/whazor/k8s-at-home-search" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star whazor/k8s-at-home on GitHub">Star</GitHubButton>
    </div>
    <Link href="/"><h1
      className="cursor-pointer text-4xl pb-5"
    >k8s at home search</h1></Link>
    <p className="mb-3">We index Flux HelmReleases from Github repositories with the <a href="https://github.com/topics/k8s-at-home" className="a" target="_blank">k8s-at-home topic</a>.
      To include your repository in this search it must be public and then add the topic <code>k8s-at-home</code> to your GitHub Repository topics. To learn more visit <a href="https://k8s-at-home.com/" className="a" target={'_blank'}>the website from k8s@home</a>.
    </p>
    <div className="relative">
      <span
        className="text-black float-right absolute right-2 top-1 text-xl cursor-pointer"
        onClick={() => navigate('/')}>✕</span>
      <input
        type="text"
        onChange={(e) => {
          addSlash(e.target.value.endsWith("/"));
          return navigate('/' + e.target.value);
        }}
        className={"search-field p-1 rounded border-2 w-full mb-2"}
        value={(params?.['search'] || '') + (!hasSlash ? '' : '/')}
        placeholder="search a chart"
        autoFocus
      />
    </div>
    {
      !loaded && <div>
        <span>Loading...</span>
        {res2.contentLength > 0 && <div>
          <span>Downloading database... {res2.received} of {res2.contentLength} kb</span>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${res}%` }}></div>
          </div></div>}</div>
    }
    {!!loaded && props.children}
  </div >;
}

const currentLocation = () => {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  if (!hash.startsWith("/")) {
    return "/" + hash;
  }
  return hash;
};

const navigate = (to: string) => (window.location.hash = to);

const useHashLocation: BaseLocationHook = () => {
  const [loc, setLoc] = useState(currentLocation());

  useEffect(() => {
    // this function is called whenever the hash changes
    const handler = () => setLoc(currentLocation());

    // subscribe to hash changes
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return [loc, navigate];
};

export function App() {
  return (
    <Router hook={useHashLocation} base={import.meta.env.BASE_URL + "#"}>
      <Body>
        <Switch>
          <Route path="/" component={() => <WordCloudView />} />
          <Route path="/top" component={() => <TopReposView />} />
          <Route path="/dashboards" component={() => <GrafanaDashboardsView />} />
          <Route<{ name: string }> path="/chart::name+" component={({ params }) =>
            <ChartView name={params['name']} />
          } />
          <Route<{ search: string }> path="/repo::search+" component={({ params }) =>
            <SearchView repo={params['search']} />
          } />
          <Route<{ search: string }> path="/:search+" component={({ params }) =>
            <SearchView search={params['search']} />
          } />
        </Switch>
      </Body>
    </Router>
  )
}

