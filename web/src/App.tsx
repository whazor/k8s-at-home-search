import { Link, Route, Routes } from 'react-router-dom'
import HelmRelease from './pages/helm-release';

// Auto generates routes from files under ./pages
// https://vitejs.dev/guide/features.html#glob-import
const pages: Record<string, {default: JSX.Element}> = import.meta.glob('./pages/*.jsx', { eager: true })

const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\.jsx$/)?.[1] || ""
  return {
    name,
    path: name === 'Home' ? '/' : `/${name.toLowerCase()}`,
    component: pages[path].default,
  }
})

export interface AppData {
  releases: {
    url: string,
    chart: string,
    release: string,
  }[]
}

export default function App({releases}: AppData) {
  return (
    <>
      <nav>
        <ul>
          {routes.map(({ name, path }) => {
            return (
              <li key={path}>
                <Link to={path}>{name}</Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <Routes>
        {routes.map(({ path, component: RouteComp }) => {
          return <Route key={path} path={path} element={<RouteComp />}></Route>
        })}
        {releases.map(({url, chart, release}) => {
          return (
            <Route
              key={url}
              path={`/hr/${url}`}
              element={<HelmRelease {...{url, chart, release}} />}
            ></Route>
          )
        })}
      </Routes>
    </>
  )
}