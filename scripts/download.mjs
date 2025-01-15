#!/usr/bin/env zx

$.verbose = false;

let date = null;

// if argument, then it is a date
if (process.argv[3]) {
    date = process.argv[3];
    console.log("using date", date);
}


// download latest releases from github
const repo = 'whazor/k8s-at-home-search';
// use $`curl` for download
const { stdout } = await $`curl -s https://api.github.com/repos/${repo}/releases?per_page=100`;

const sortedReleases = JSON.parse(stdout).map(r => r.name).sort();
const firstName = sortedReleases[0];
const lastName = sortedReleases[sortedReleases.length - 1];
const monthOldName = sortedReleases.length > 33 && sortedReleases[sortedReleases.length - 32];

const releases = JSON.parse(stdout);
// print first and last release
console.log(`from release: ${firstName}, to latest release: ${lastName}, one month ago: ${monthOldName}`);



let release;
if (date) {
    release = releases.find(({ name }) => name.includes(date));
} else {
    release = releases.find(({ name }) => name === lastName);
}
if (!release) {
    console.error("no release found");
    process.exit(1);
}
console.log(`found release: ${release.name}`);

// parse json
const { assets } = release;

const repos = assets.find(({ name }) => name === 'repos.db')["browser_download_url"];
const reposExtended = assets.find(({ name }) => name === 'repos-extended.db')["browser_download_url"];

console.log(`curl -s -L ${repos} -o ./web/repos${
    date ? `-${date}` : ""
}.db`);
console.log(`curl -s -L ${reposExtended} -o ./web/repos-extended${
    date ? `-${date}` : ""
}.db`);

// download files
await $`curl -s -L ${repos} -o ./web/repos${
    date ? `-${date}` : ""
}.db`;
await $`curl -s -L ${reposExtended} -o ./web/repos-extended${
    date ? `-${date}` : ""
}.db`;