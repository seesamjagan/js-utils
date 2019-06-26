const download = (content, contentType, fileName = "logs.txt") => {
  // var browser = "";
  var link;
  if (window.navigator.msSaveBlob !== undefined) {
    // browser = "IE/Edge";
    let blob = new Blob([content]);
    window.navigator.msSaveBlob(blob, fileName);
  } else if (window.webkitURL) {
    // browser = "CHROME";
    link = document.createElement("a");
    link.setAttribute("href", contentType + "," + encodeURI(content));
    link.setAttribute("target", "_blank");
    link.setAttribute("download", fileName);
    link.click();
  } else if (document.createEvent) {
    // browser = "FIREFOX";
    link = document.createElement("a");
    link.setAttribute("href", encodeURI(contentType + "," + content));
    link.setAttribute("download", fileName);
    var e = document.createEvent("MouseEvents");
    e.initEvent("click", true, true);
    link.dispatchEvent(e);
  } else {
    // TODO :: handle unknow browser
    return false;
  }
  if (link) {
    setTimeout(() => document.body.removeChild(link), 0);
  }
  return true;
};

const toRow = (row, keys) => {
  return keys.reduce((pv, cv, i) => [...pv, row[cv]], []).join(",");
};

const toCSV = (items, keys) => {
  return items.reduce((pv, cv, i) => (pv += toRow(cv, keys) + "\n"), "");
};

/**
 * utility function to export an array of objects into csv file format.
 * @param {array} data array of objects which we have to export as csv
 * @param {array} keys array of field name strings. the keys in the object to 
 * export in the csv. which is optional, when passed null, it will decide the
 * keys from the first item in the data array
 * @param {string} fileName name of the file when downloading
 */
export const exportAsCSV = (data, keys, fileName = "data.csv") => {
  keys = keys || Object.keys(data[0]);
  let contentType = "data:text/csv;charset=utf-8";
  let content = keys.join(",") + "\n" + toCSV(data, keys);
  return download(content, contentType, fileName);
};
