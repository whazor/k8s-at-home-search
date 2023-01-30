import { Route, Routes } from 'react-router-dom'
import HelmRelease from './pages/helm-release';
import Home from './pages/index';
import styles from "./index.css?inline"
import { SearchBar } from './components/search';
import { AppData as HRAppData, denormalize } from './generators/helm-release/models';
import GitHubButton from 'react-github-btn';

export type AppData = HRAppData;

export default function App(props: AppData & { pageData: any }) {
  const { pageData, } = props;
  const releases = denormalize(props).releases;
  return (
    <div className='p-4 dark:bg-gray-900'>
      <style>{styles}</style>
      <nav>
      <div className="float-right p-4 pt-0">
        <GitHubButton href="https://github.com/whazor/k8s-at-home-search" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star whazor/k8s-at-home on GitHub">Star</GitHubButton>
      </div>
        <a
        href={'/k8s-at-home-search/'} 
        ><h1 className="text-3xl dark:text-white">k8s at home search</h1></a>
        <p className="text-lg dark:text-white">Search for a helm release</p>
      </nav>
      <div className='pt-2'>
        <div className='mb-4'>
          <SearchBar releases={releases} />
        </div>
        <Routes>
          <Route key={"/"} path={"/"} element={<Home releases={releases} />} />
          {releases.map(({ key, chart, release }) => {
            return (
              <Route
                key={'hr-'+key}
                path={`/hr/${key}`}
                element={<HelmRelease {...{ chart, release }} 
                      url={'/hr/'+key}
                      pageData={pageData}
                      keyFileMap={props.keyFileMap}
                       />}
              />
            )
          })}
        </Routes>
      </div>
    </div>
  )
}