import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App, { AppData } from './App'


function b64DecodeUnicode(str: string) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

// app data is passed from server to client via window.__APP_DATA__
declare global {
  interface Window {
    __APP_DATA__: string,
    __PAGE_DATA__: string,
  }
}
const appData = JSON.parse(b64DecodeUnicode(window.__APP_DATA__)) as AppData; 
const pageData = JSON.parse(b64DecodeUnicode(window.__PAGE_DATA__));

ReactDOM.hydrateRoot(
  document.getElementById('app')!,
  <BrowserRouter basename='/k8s-at-home-search/'>
    <App {...appData} pageData={pageData} />
  </BrowserRouter>,
)
console.log('hydrated')