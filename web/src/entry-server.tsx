import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App, { AppData } from './App'



export function render(url: string, appData: AppData) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} /*context={context}*/>
      <App {...appData} />
    </StaticRouter>,
  )
}
