// const WORDPRESS_ENDPOINT_URL =
// "https://testproject-wordpress-10312022.lcbits.com/wp-json/wp/v2/posts";

const APIS = require("./api-call");

const produceWordCountMap = require("./wordCount");

// pull posts from host and after produce word count map, return it
const pullPostsAndSendWordcountmap = async (hostUrl) => {
  const posts = await APIS.getPosts(hostUrl);
  let combinedPostsContents = "";
  for (id in posts) {
    combinedPostsContents += posts[id].content.rendered; // add all post's content
  }

  return produceWordCountMap(combinedPostsContents); // produce word count map and return
};

module.exports = pullPostsAndSendWordcountmap;
