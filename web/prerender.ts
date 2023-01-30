#!/usr/bin/env ts-node
import fs from 'node:fs'
import path from 'node:path'
import { Renderer } from './renderer'

const toAbsolute = (p: string) => path.resolve(__dirname, p)

const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8')


const renderer = new Renderer()
; (async () => {
  await renderer.prepareData();

  // mkdir
  await fs.promises.mkdir(toAbsolute('dist/static/hr/'), { recursive: true });

  async function generatePage(url: string) {
    const html = await renderer.generatePage("/k8s-at-home-search"+url, template);
    await fs.promises.writeFile(toAbsolute(`dist/static${url + (url.endsWith('/') ? 'index' : '')}.html`), html);
  }
  
  const fileData = renderer.jsonFilesData;

  for(const [i, jsonPageDataString] of Object.entries(fileData)) {
    await fs.promises.writeFile(toAbsolute(`dist/static/hr/data-${i}.json`), jsonPageDataString);
  }
  
  let pageGenerators: Array<Promise<void>> = [];

  for(const key of renderer.getPages()) {
    pageGenerators.push(generatePage(key));
  }

  const routesToPrerender = ["/"];
  for (const url of routesToPrerender) {
    pageGenerators.push(generatePage(url));
  }
  await Promise.all(pageGenerators);
})()