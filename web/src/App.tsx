import { Route, Routes } from 'react-router-dom'
import HelmRelease from './pages/helm-release';
import Home from './pages/index';
import styles from "./index.css?inline"
import { SearchBar } from './components/search';
import { AppData as HRAppData, denormalize } from './generators/helm-release/models';
import GitHubButton from 'react-github-btn';

export type AppData = HRAppData;

export default function App(props: AppData & { pageData: any }) {
  const { pageData, repoAlsoHas, } = props;
  const releases = denormalize(props).releases;
  return (
    <div className='p-4'>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <nav>
      <div className="float-right m-4 w-32 h-7 place-content-end">
        <GitHubButton href="https://github.com/whazor/k8s-at-home-search" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star whazor/k8s-at-home on GitHub">Star</GitHubButton>
      </div>
        <a
        href={'/k8s-at-home-search/'} 
        ><h1 className="text-3xl dark:text-gray-300">k8s at home search</h1></a>
        <p className="text-lg dark:text-gray-300">Search for a helm release</p>
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
                    key={'hr-el'+key}
                      url={'/hr/'+key}
                      pageData={pageData}
                      repoAlsoHas={repoAlsoHas}
                      keyFileMap={props.keyFileMap}
                       />}
                ></Route>
            )
          })}
        </Routes>
      </div>
    </div>
  )
}