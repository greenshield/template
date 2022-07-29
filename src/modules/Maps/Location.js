import React from "react";

function App(props) {
  const [pos, setPos] = React.useState({ lat: null, lng: null });

  React.useEffect(() => {
    console.log("CHECK");
    console.log(window.pos);
    console.log(props.pos);
    //window.ReactNativeWebView.postMessage('{"action":"log","message":"window test is "}')

    if (props.pos && props.pos.lat) {
      //window.ReactNativeWebView.postMessage('{"action":"log","message":"window lat is '+props.pos.lat+'"}')
    }

    if (window.pos) {
      setPos(window.pos);
      props.setPos(window.pos);
    }
  }, [window.pos, props.pos, props.setPos]);

  if (window.pos) {
    //window.ReactNativeWebView.postMessage('{"action":"log","message":"window lat live '+window.pos.lat+'"}')
  }

  return null;
}

export default App;
