#!/usr/bin/env zx

console.log("hello world");

// download latest releases from github
const repo = 'whazor/k8s-at-home-search';
// use $`curl` for download
const { stdout } = await $`curl -s https://api.github.com/repos/${repo}/releases/latest`;
// parse json
const { assets } = JSON.parse(stdout);

const repos = assets.find(({ name }) => name === 'repos.db.zz')["browser_download_url"];
const reposExtended = assets.find(({ name }) => name === 'repos-extended.db.zz')["browser_download_url"];

// download files
await $`curl -s -L ${repos} -o repos.db.zz`;
await $`curl -s -L ${reposExtended} -o repos-extended.db.zz`;

// unpack with pigz
await $`pigz -d -k repos.db.zz`;
await $`pigz -d -k repos-extended.db.zz`;

// move to web/
await $`mv repos.db ./web/`;
await $`mv repos-extended.db ./web/`;