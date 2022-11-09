import React from "react";
import styles from "../styles/UrlConnect.module.css";
import axios from "axios";

/**
 * In this commponent you input host url and check connection.
 */
export default function UrlConnect(props) {
  const SERVER_URL=props.serverUrl;
  const [hostUrl, setHostUrl] = React.useState(
    "https://testproject-wordpress-10312022.lcbits.com/wp-json/wp/v2/posts"
  );
  const [connectionMessage, setConnectionMessage]=React.useState('');
  return (
    <div>
      <div className={styles.urlPan}>
        <input
          type="text"
          value={hostUrl}
          onChange={(e) => {
            setHostUrl(e.target.value);
          }}
          data-testid="hosturl" // for test purpose only
        />
        <button
          onClick={async (e) => {
            e.preventDefault();
            const response=await axios.post(`${SERVER_URL}/api/hostconnect`, {
              hosturl: hostUrl,
            });
            setConnectionMessage(response.data.message); // connection message. ex. "connection opened. starting service"
          }}
          data-testid="hostbtn" // for test purpose only
        >
          Connect
        </button>
      </div>
      {/* display message whether connection opened or failed */}
      <div className={styles.message} data-testid="msg" style={{display: connectionMessage===''?'none':'block'}}>
          <p>{connectionMessage}</p>
      </div>
    </div>
  );
}
