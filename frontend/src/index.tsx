import React from "react";
import { App } from "./App";

import 'virtual:fonts.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools'

import { createRoot } from 'react-dom/client';
const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
