import React from "react";
import ReactDOM from "react-dom";
// import GlobalStyles from './styles/GlobalStyles'
import { App } from "./App";
import './theme.ts';
const app = document.getElementById("app");
ReactDOM.render(
  <React.StrictMode>
  {/* <GlobalStyles /> */}
  <App />
</React.StrictMode>
, app);