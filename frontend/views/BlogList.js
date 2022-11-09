import { useState, useEffect } from "react";
import styles from "../styles/Blog.module.css";
import axios from "axios";

/**
 * If connection opened, in this component you display posts
 */
export default function BlogList(props) {
  const WSCLIENT = props.client;
  const SERVER_URL = props.serverUrl;

  const [socketStatus, setSocketStatus] = useState(""); // display socket status on page.

  const [bufWordCountMap, setBufWordCountMap] = useState(""); //initial map.
  const [wordCountMap, setWordCountMap] = useState(""); // new map

  const [posts, setPosts] = useState([]); // actual posts

  useEffect(() => {
    try {
      WSCLIENT.onopen = () => {
        console.log("websocket opened");
        setSocketStatus("websocket connection opened");
      };
      WSCLIENT.onclose = () => {
        console.log("websocket closed");
        setSocketStatus("websocket connection closed");
      };
      WSCLIENT.onerror = () => {
        console.log("websocket error");
      };
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
        getPosts(); //new posts
      }
    }
  }, [wordCountMap, bufWordCountMap]);

  return (
    <div>
      <p style={{ textAlign: "center" }}>{socketStatus}</p>
      <div className={styles.grid} data-testid="posts">
        {posts.map((post, id) => (
          <a className={styles.card} key={id} href={post.link} target="blank">
            <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h2>
            <p dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}></p>
          </a>
        ))}
      </div>
    </div>
  );
}
