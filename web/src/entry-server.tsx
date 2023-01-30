import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App, { AppData } from './App'



export function render(url: string, appData: AppData, pageData: any) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} basename='/k8s-at-home-search/' /*context={context}*/>
      <App {...appData} pageData={pageData} />
    </StaticRouter>,
  )
}

export type RenderFunction = typeof render;