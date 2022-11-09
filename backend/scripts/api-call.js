const fetch = require("node-fetch");
const {STATUS_CODE_ERR} = require('../config');

/*
  check if url is valid
*/
const isValidUrl = (urlString) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};
/*
  get posts
*/
const getPosts = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

//check host connection
const testHostConnection = async (url) => {
  // check the url you entered is vaild
  // if not valid, return "invalid_url"
  if (!isValidUrl(url)) {
    return "invalid_url";
  } else {
    try {
      const response = await fetch(url);
      return response.status; // return server status. ex. if connection success return 200
    } catch (e) {
      return STATUS_CODE_ERR; // if fake url, return 404
    }
  }
};

module.exports = {
  getPosts,
  testHostConnection,
};
