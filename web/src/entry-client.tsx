import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App, { AppData } from './App'

// app data is passed from server to client via window.__APP_DATA__
declare global {
  interface Window {
    __APP_DATA__: AppData,
    __PAGE_DATA__: any,
  }
}
const appData = window.__APP_DATA__; 
const pageData = window.__PAGE_DATA__;

ReactDOM.hydrateRoot(
  document.getElementById('app')!,
  <BrowserRouter>
    <App {...appData} pageData={pageData} />
  </BrowserRouter>,
)
console.log('hydrated')