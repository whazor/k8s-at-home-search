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

const repos = assets.find(({ name }) => name === 'repos.db')["browser_download_url"];
const reposExtended = assets.find(({ name }) => name === 'repos-extended.db')["browser_download_url"];

// download files
await $`curl -s -L ${repos} -o ./web/repos.db`;
await $`curl -s -L ${reposExtended} -o ./web/repos-extended.db`;