import { Link, Route, Routes } from 'react-router-dom'
import HelmRelease from './pages/helm-release';
import Home from './pages/index';
import "./index.css"
import { SearchBar } from './components/search';

// Auto generates routes from files under ./pages
// https://vitejs.dev/guide/features.html#glob-import
// const pages: Record<string, {default: () => JSX.Element}> = []
// const pages = {"/pages/index.jsx": Home};
// const routes = Object.keys(pages).map((path: keyof typeof pages) => {
//   const name = path.match(/\.\/pages\/(.*)\.jsx$/)?.[1] || ""
//   return {
//     name,
//     path: name === 'Home' ? '/' : `/${name.toLowerCase()}`,
//     component: pages[path],
//   }
// })

export interface AppData {

  releases: {
    key: string,
    chart: string,
    release: string,
    count: number,
    icon?: string,
  }[]
}

export default function App({ releases, pageData }: AppData & { pageData: any }) {

  return (
    <div className='p-4 dark:bg-black'>
      <nav>
        <a
        href={'/'} 
        ><h1 className="text-3xl dark:text-white">k8s at home search</h1></a>
        <p className="text-lg dark:text-white">Search for a helm release</p>
        <ul>
          {/* <li><Link to="/">Home</Link></li> */}
          {/* {routes.map(({ name, path }) => {
            return (
              <li key={path}>
                <Link to={path}>{name}</Link>
              </li>
            )
          })} */}
        </ul>
      </nav>
      <div className='pt-2'>
        <div className='mb-4'>
          <SearchBar releases={releases} />
        </div>
        <Routes>
          <Route key={"/"} path={"/"} element={<Home releases={releases} />}></Route>
          {/* {routes.map(({ path, component: Component }) => {
          return <Route key={path} path={path} element={<Component />}></Route>
        })} */}
          {releases.map(({ key, chart, release }) => {
            return (
              <Route
                key={key}
                path={`/hr/${key}`}
                element={<HelmRelease {...{ key, chart, release }} pageData={pageData} />}
              ></Route>
            )
          })}
        </Routes>
      </div>
    </div>
  )
}