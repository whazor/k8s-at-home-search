export function JSONStringToYaml(json: string) {
  try{
    return JSONToYaml(JSON.parse(json));
  } catch(e) {
    return json;
  }
}
export function JSONToYaml(json: any, level: number = 0, isFirst=(level==0)) {
  const spaces = " ".repeat(level*2);
  let result = "";

  if(Array.isArray(json)) {
    result += `\n`
    for (const item of json) {
      result += `${spaces}- ${JSONToYaml(item, level+1, true)}`;
    }
  } else if(typeof json === "object") {
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        if(isFirst) {
          isFirst = false;
          result += `${key}: ${JSONToYaml(json[key], level+1)}`;
        } else {
          result += `\n${spaces}${key}: ${JSONToYaml(json[key], level+1)}`;
        }
      }
    }
  } else {
    result += String(json);
  }

  return result
}
