#!/usr/bin/env ts-node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Renderer } from './renderer'

// import { render } from './src/entry-server';
import {
  collector as hrCollector,
  appDataGenerator as hrAppDataGenerator,
  pageGenerator as hrPageGenerator,
} from './src/generators/helm-release';

const toAbsolute = (p: string) => path.resolve(__dirname, p)

const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8')

const renderer = new Renderer()
; (async () => {
  await renderer.prepareData();

  const hrPageData = await hrCollector(renderer.db);
  
  async function generatePage(url: string) {
    const html = await renderer.generatePage(url, template);
     
    await fs.promises.writeFile(toAbsolute(`dist/static${url + (url.endsWith('/') ? 'index' : '')}.html`), html);
  }
  
  let pageGenerators: Array<Promise<void>> = [];

  for(const key of Object.keys(hrPageGenerator(hrPageData))) {
    pageGenerators.push(generatePage(key));
  }
  const routesToPrerender = ["/"];
  for (const url of routesToPrerender) {
    pageGenerators.push(generatePage(url));
  }
  await Promise.all(pageGenerators);
})()