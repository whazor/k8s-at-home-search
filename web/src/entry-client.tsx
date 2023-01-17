import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App, { AppData } from './App'

// app data is passed from server to client via window.__APP_DATA__
declare global {
  interface Window {
    __APP_DATA__: AppData
  }
}
const appData = window.__APP_DATA__; 

ReactDOM.hydrateRoot(
  document.getElementById('app')!,
  <BrowserRouter>
    <App {...appData} />
  </BrowserRouter>,
)
console.log('hydrated')