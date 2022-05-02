import React, { useEffect, useState } from "react";
import { BaseLocationHook, Link, Route, Router, useRoute } from "wouter";


import { tw } from 'twind'
import { WordCloudview } from "./components/word_cloud";
import { SearchView } from "./components/search";
import { TopReposview } from "./components/top_repos";


function Body(props: { children: React.ReactNode,  }) {
  const [, params] = useRoute<{search: string}>("/:search");

  return <div className={tw`w-10/12 mt-2 mx-auto bg-white rounded-xl shadow-lg p-2`}>
      <Link href="/"><h1 
        className={tw`cursor-pointer text-4xl pt-5 pb-5`}
      >k8s at home search</h1></Link>
      <p className={tw`mb-2`}>We index Flux HelmReleases from Github repositories with the <a href="https://github.com/topics/k8s-at-home" target="_blank">k8s-at-home topic</a>.
      To include your repository in this search it must be public and then add the topic <code>k8s-at-home</code> to your GitHub Repository topics. To learn more visit <a href="https://k8s-at-home.com/" target={'_blank'}>the website from k8s@home</a>.</p>
      <div className={tw`relative`}>
    <span 
      className={tw`text-black float-right absolute right-2 top-1 text-xl cursor-pointer`}
      onClick={() => navigate('/')}>✕</span>
    <input 
      type="text" 
      onChange={(e) => navigate('/' + e.target.value)} 
      className={'search-field ' + tw`p-1 pb-0 mb-2 rounded border-2 w-full`} 
      value={params?.['search'] || ''}
      placeholder="search a chart"
    />
    </div>
    
      {props.children}
    </div>;
}

const currentLocation = () => {
  return window.location.hash.replace(/^#/, "") || "/";
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
  const WordCloud = () => {
    return <WordCloudview setSearchValue={s => navigate('/' + s)} />
  }

  return (
    <Router hook={useHashLocation}>
      <Body>
      
      <Route path="/" component={WordCloud} />
      <Route path="/top" component={TopReposview} />
      <Route<{search: string}> path="/:search" component={({params}) => {
        console.log(params);
        if (params['search'] !== 'top') {
          return <SearchView searchValue={params['search']} />
        }
        return null;
      }} />
    </Body>
    </Router>
  )
}

