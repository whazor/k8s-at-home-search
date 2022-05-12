import semverRegex from 'semver-regex';
import semver from 'semver';


export const localCompareSort = <Item, Key extends keyof Item>(key: Key) => (a: Item, b: Item) => {
  return (a?.[key] || "").toLocaleString().localeCompare((b?.[key] || "").toLocaleString());
}
export const intSort = <Item, Key extends keyof Item>(key: Key, inversed=false) => (a: Item, b: Item) => {
  const aVal: any = a?.[key] || "0";
  const bVal: any = b?.[key] || "0";
  const aInt: number = Number.isInteger(aVal) ? aVal as number : parseInt(aVal.toLocaleString());
  const bInt: number = Number.isInteger(bVal) ? bVal as number : parseInt(bVal.toLocaleString());
  return inversed ? bInt - aInt : aInt - bInt;
}

const sr = semverRegex();
export function parseVersion(str?: string) {
  const res = sr.exec(str || "0.0.1");
  if(res) {
    return res[0] || str || "0.0.1";
  }
  return str || "0.0.1";
}
export function compareVersions(a?: string, b?: string) {
  let aClean = "0.0.1", bClean = "0.0.1";
  try {
    aClean = semver.clean(parseVersion(a));
  } catch (_e) {}
  try {
    bClean = semver.clean(parseVersion(b));
  } catch (_e) {}
  return semver.compare(aClean || "0.0.1", bClean || "0.0.1");
}
export const versionSort = <Item, Key extends keyof Item>(key: Key) => (a: Item, b: Item) => {
  return compareVersions(a?.[key] as any, b?.[key] as any);
}