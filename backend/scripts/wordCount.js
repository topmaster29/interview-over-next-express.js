//word count

// return word count map
// for example if words="and and are in", return {"and":2, "are":1, "in":1}
function produceWordCountMap(strings) {
  var wordcntmap = strings
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .reduce(function (map, word) {
      map[word] = (map[word] || 0) + 1;
      return map;
    }, Object.create(null));
  return wordcntmap;
}

module.exports = produceWordCountMap;
