import { Link, Route, Routes } from 'react-router-dom'
import HelmRelease from './pages/helm-release';
import Home from './pages/index';
import styles from "./index.css?inline"
import { SearchBar } from './components/search';
import { AppData as HRAppData, denormalize } from './generators/helm-release/models';

export type AppData = HRAppData;

export default function App(props: AppData & { pageData: any }) {
  const { pageData, } = props;
  const releases = denormalize(props).releases;
  return (
    <div className='p-4 dark:bg-gray-900'>
      <style>{styles}</style>
      <nav>
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