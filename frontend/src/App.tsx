import React, { useEffect, useState } from "react";
import { BaseLocationHook, Link, Route, Switch, Router, useRoute } from "wouter";
import { tw } from 'twind'
import { WordCloudview } from "./components/word_cloud";
import { SearchView } from "./components/search";
import { TopReposview } from "./components/top_repos";
import { ChartView } from "./components/chart";
import { dataProgressSubject } from "./db/queries";
import { useObservableState, useSubscription } from "observable-hooks";
import { map } from "rxjs/operators";
import GitHubButton from 'react-github-btn';
import { GrafanaDashboardsView } from "./components/grafana";

function Body(props: { children: React.ReactNode,  }) {
  const [, params] = useRoute<{search: string}>("/:search+");
  console.log("params", params)
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
  return <div className={tw`md:w-11/12 lg:w-10/12 mt-2 mx-auto bg-white rounded-xl shadow-lg p-2`}>
      <div className={tw`float-right p-4`}>
        <GitHubButton href="https://github.com/whazor/k8s-at-home-search" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star whazor/k8s-at-home on GitHub">Star</GitHubButton>
      </div>
      <Link href="/"><h1 
        className={tw`cursor-pointer text-4xl pt-5 pb-5`}
      >k8s at home search</h1></Link>
      <p className={tw`mb-2`}>We index Flux HelmReleases from Github repositories with the <a href="https://github.com/topics/k8s-at-home" target="_blank">k8s-at-home topic</a>.
      To include your repository in this search it must be public and then add the topic <code>k8s-at-home</code> to your GitHub Repository topics. To learn more visit <a href="https://k8s-at-home.com/" target={'_blank'}>the website from k8s@home</a>.
      </p>
      <div className={tw`relative`}>
    <span 
      className={tw`text-black float-right absolute right-2 top-1 text-xl cursor-pointer`}
      onClick={() => navigate('/')}>✕</span>
    <input 
      type="text" 
      onChange={(e) => {
        addSlash(e.target.value.endsWith("/"));
        return navigate('/' + e.target.value);
      }} 
      className={'search-field ' + tw`p-1 pb-0 mb-2 rounded border-2 w-full`} 
      value={(params?.['search'] || '') + (!hasSlash ? '' : '/')}
      placeholder="search a chart"
      autoFocus
    />
    </div>
      {!loaded && <div>
        <span>Loading...</span>
        {res2.contentLength > 0 && <div>
        <span>Downloading database... {res2.received} of {res2.contentLength} kb</span>
        <div className={tw`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700`}>
        <div className={tw`bg-blue-600 h-2.5 rounded-full`} style={{width: `${res}%`}}></div>
      </div></div>}</div>}
      {!!loaded && props.children}
    </div>;
}

const currentLocation = () => {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  if(!hash.startsWith("/")) {
    return "/" + hash;
  }
  return hash;
};

const navigate = (to) => (window.location.hash = to);

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
          <Route path="/" component={() => <WordCloudview />} />
          <Route path="/top" component={() => <TopReposview />} />
          <Route path="/dashboards" component={() => <GrafanaDashboardsView />} />
          <Route<{name: string}> path="/chart::name+" component={({params}) => 
            <ChartView name={params['name']} />
          } />
          <Route<{name: string}> path="/repo::search+" component={({params}) => 
            <SearchView repo={params['search']} />
          } />
          <Route<{search: string}> path="/:search+" component={({params}) => 
            <SearchView search={params['search']} />
          } />
        </Switch>
      </Body>
    </Router>
  )
}

