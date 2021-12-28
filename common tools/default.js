const isNum = (a) => String(a).replace(" ", "") != "" && !isNaN(a);

const setParams = (req, a) => {
  Object.entries(a).forEach(([b, c]) => {
    req.params[b] = c;
  });
};

const pushObjIfValid = (arr, el) => {
  if (el) arr.push(el);
};

const setParamEach = ({ req, key, value }) => {
  req.params[key] = value;
};

function encode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, escape);
}

function decode(str) {
  return decodeURIComponent(str).replace(/[!'()*]/g, escape);
}

function decodeObject(obj) {
  return Object.keys(obj).reduce(
    (a, b) => ({
      ...a,
      [b]: typeof obj[b] === "string" ? decode(obj[b]) : obj[b],
    }),
    {}
  );
}

function isUrlValid(url, { VPS_OPTIONS, VPS_SELECTS }) {
  const currentUrl = url
    .split(";")
    .map((a) => a.split(","))
    .map((a) => {
      const select = a[0].split("-");
      const item = a[1].split("-");
      return { [select[0]]: select[1], item: item[1] };
    })
    .filter((a) => !a.sc);

  if (
    currentUrl.every(({ s, item }) =>
      VPS_SELECTS.find(
        (a) =>
          a.UID == s && VPS_OPTIONS.find((a) => a.UID == item)?.PARENT_UID == s
      )
    )
  )
    return currentUrl;
  return false;
}

module.exports = {
  isNum,
  setParams,
  pushObjIfValid,
  setParamEach,
  encode,
  decode,
  decodeObject,
  isUrlValid,
};
