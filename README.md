# thekey solutions - Interview Project

## Overview

Additional project overview available at:
https://www.figma.com/file/qerYdfNh15iN50FDzfUawr/interview-Project

## Used technology

Frontend : react - Next.js
https://nextjs.org/

Backend : node.js - Express.js
https://expressjs.com/

## Installation

Make sure you have Node.js installed!
https://nodejs.org/en/download/

In your project root:

    $ cd backend
    $ npm install
    $ npm start

For testing in frontend:
$ npm run test

After the backend setup has been completed:

    $ cd frontend
    $ npm install
    $ npm run dev

For test backend:

    $ npm run test

Access project in browser at:

```
    localhost:3000
```

## Workflow of project

- User input host api url and then click connect btn
  ex. [wordpress page url]/wp-json/wp/v2/posts

- The connection failure or success is communicated via system notices

- The system retrives all posts from host api url and displays them.
- Every 3 seconds (you can change num), the backend retrives all posts from the host, processes the word count map and sends it to frontend via a websocket.
- The frontend checks if there is new data by comparing the old word count map with the new word count map.
- In case there is new data, the frontend gets all posts from host and displays them.

## Code explaination

Backend
The backend is responsible for fetching the WordPress Blog and sending the processed Data to the Frontend.

1. fetch JSON file from Wordpress Blog
2. process fetched Data to a word count map
3. return processed map

```javascript
#!/backend/scripts/api-call.js
//check host connection
const testHostConnection = async (url) => {
// check if the url you entered is vaild
// if it is not valid, return "invalid_url"
  if (!isValidUrl(url)){
    return "invalid_url";
  }
  else {
    try{
      const response = await fetch(url);
      return response.status; // return server status. ex. if connection success return 200
    }
    catch(e){
      return 404 // if fake url, return 404
    }
  }
};


#!/backend/scripts/wordCount.js
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

#!/backend/scripts/blogprocess.js

/* pull posts from host.
   process word count map and return it */
const pullPostsAndSendWordcountmap = async (hostUrl) => {
  const posts = await APIS.getPosts(hostUrl);
  let combinedPostsContents = "";
  for (id in posts) {
    combinedPostsContents += posts[id].content.rendered; // add all post's content
  }

  return produceWordCountMap(combinedPostsContents); // produce word count map and return
};

#!/backend/app.js

...
    intervalId = setInterval(async () => {
      const wcm = await pullPostsAndSendWordcountmap(hosturl);
      connection.send(JSON.stringify(wcm)); // send word count map via websocket
    }, FETCH_INTERVAL_SECONDS); // you can change seconds. 3000ms



```

Frontend
The frontend is resonsible for checking for new posts and displaying the WordPress Blog.

1. receive word count map from the backend via websocket
2. compare old map with new map
3. if there is any change, frontend gets posts form Wordpress Blog and display them

```javascript
#!/pages/index.js

const websocketClient = W3CWebSocket(WEBSOCKET_URL); //create websocket client

<UrlConnect serverUrl={SERVER_URL} />

<BlogList client={websocketClient} serverUrl={SERVER_URL} /> // send websocket client to BlogList with props

#!/views/UrlConnect.js
// check host connection
const response=await axios.post(`${SERVER_URL}/api/hostconnect`, {
      hosturl: hostUrl,
});
setConnectionMessage(response.data.message); // connection message. ex. "connection opened. starting service"


#!/views/BlogList.js
useEffect(() => {
    try {
     ...
      let pullcount = 0; // count pull posts request to host
      // frontend receives the word count map from backend via websocket every few seconds
      WSCLIENT.onmessage = (message) => {
        console.log("msg");
        pullcount++;
        setSocketStatus(`retriving posts iteratioin : ${pullcount}`);
        setWordCountMap(message.data); // word count map received newly
      };
    } catch (e) {
      setSocketStatus("websocket connection failed");
    }
  }, [WSCLIENT]);

  // compare old map and new map. if equal, return true
  const checkWordCountMap = (oldmap, newmap) => {
    if (oldmap === "" || newmap === "") return false;
    if (Object.keys(oldmap).length != Object.keys(newmap).length) return false;
    Object.keys(oldmap).forEach((key, id) => {
      if (oldmap[key] != newmap[key]) return false;
    });
    return true; //equal
  };

  useEffect(() => {
    const getPosts = async () => {
      const response = await axios.get(`${SERVER_URL}/api/getposts`);
      setPosts(response.data);
    };
    if (bufWordCountMap === "" && wordCountMap != "") {
      // when the frontend boots initially, frontend receive initial word count map from backend and stores to
      // bufWordCountMap, and display posts on page
      getPosts(); //initial get posts
      setBufWordCountMap(wordCountMap);
    } else if (bufWordCountMap != "" && wordCountMap != "") {
      // Once websocket connection is established, frontend receives map from backend every few seconds and
      // stores to wordCountMap. and then compare word count map
      if (!checkWordCountMap(bufWordCountMap, wordCountMap)) {
        // if there is any change, refresh page
        console.log("this is check");
        // and then save map
        setBufWordCountMap(wordCountMap); //save map
        getPosts(); //if there is any change, get new posts and display them
      }
    }
  }, [wordCountMap, bufWordCountMap]);


```

## Scalibility

A config file contains all important, configurable const and variable that can be interchanged.

Additionally, I have followed the following coding guidelines in order to support scalability and readability.
See https://www.figma.com/file/qerYdfNh15iN50FDzfUawr/interview-Project --> Code Guidline

## Modular/flexible

Frontend

The main page consists of two components. 'BlogList.js', 'UrlConnect.js'

```
UrlConnect.js
```

In this commponent you input the host url and check connection.

```
BlogList.js
```

If connected, the component displays the wordpress posts

Backend

The structure of the backend is as follows:

```javascript
app.js;
scripts +
  api -
  call.js + // all api calls are in here
  blogprocess.js + // pull posts and send word count map
  wordCount.js; // process word count map
```

## Code security

After the installation of the module, you can check for vulnerabilities using (within the 'backend' directory):

```
npm audit
```

In the fronend you can use the'ErrorBoundary' component to detect and process errors.

In the backend you can use the 'try-catch' statement.

```javascript
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
      return 404; // if fake url, return 404
    }
  }
};
```

## Automatic testing

to initiate the testing process run:

    $ npm run test

there are two test in backend

```
api-call.test.js
wordcount.test.js
```

for example

```javascript
#!/wordcount.test.js

var wordCount = require("../scripts/wordCount");

describe("word count test", () => {
  test("to equal", () => {
    var result = wordCount("and and"); // get result by calling the function with simple words, in which the result can be predicted.
    expect(result).toEqual({ and: 2 }); // and then compare the result and your predictions.
  });
});
```
