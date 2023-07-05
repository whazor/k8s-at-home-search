#!/usr/bin/env zx

$.verbose = false;

// download latest releases from github
const repo = 'whazor/k8s-at-home-search';
// use $`curl` for download
const { stdout } = await $`curl -s https://api.github.com/repos/${repo}/releases`;

const releases = JSON.parse(stdout);

// get latest release
const latestName = releases.map(({ name }) => name).sort().reverse()[0];
const latest = releases.find(({ name }) => name === latestName);
console.log(`latest release: ${latest.name}`);

// parse json
const { assets } = latest;

const repos = assets.find(({ name }) => name === 'repos.db.zz')["browser_download_url"];
const reposExtended = assets.find(({ name }) => name === 'repos-extended.db.zz')["browser_download_url"];

// download files
await $`curl -s -L ${repos} -o repos.db.zz`;
await $`curl -s -L ${reposExtended} -o repos-extended.db.zz`;

// unpack with pigz
await $`pigz -d -k repos.db.zz`;
await $`pigz -d -k repos-extended.db.zz`;

// move to web/
await $`cp repos.db ./web/`;
await $`cp repos-extended.db ./web/`;

await $`rm -f repos.db.zz`;
await $`rm -f repos-extended.db.zz`;