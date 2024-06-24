import { useEffect, useState } from "react";
import "./App.css";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Button } from "./components/Button";
import { InputVideo } from "./components/InputVideo";
import { Inputfile } from "./components/Inputfile";
import { Header } from "./components/Header";
import { Dbutton } from "./components/Dbutton";
import { Resultimg } from "./components/Resultimg";

const ffmpeg = createFFmpeg({
  log: true,
  corePath: "http://localhost:5173/ffmpeg-core.js",
});

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    load();
  }, []);

  const convertToGif = async () => {
    //Writing the .mp4 to the FFmpeg file system
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(video));

    //Run the FFmpeg command-line, converting the .mp4 into .gif file
    await ffmpeg.run(
      "-i",
      "video1.mp4",
      "-t",
      "2.5",
      "-ss",
      "2.0",
      "-f",
      "gif",
      "out.gif"
    );
    //Read the .gif file back from the FFmpeg file system
    const data = ffmpeg.FS("readFile", "out.gif");
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );
    setGif(url);
  };

  const download = (e) => {
    console.log(e.target.href);
    fetch(e.target.href, {
      method: "GET",
      headers: {},
    })
      .then((Response) => {
        Response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "image/gif");
          document.body.appendChild(link);
          link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return ready ? (
    <div className="App">
      <Header />
      {video && <InputVideo video={video} />}
      <Inputfile setVideo={setVideo} />
      <Button convertToGif={convertToGif} />
      <h1>Result</h1>
      {gif && <Resultimg gif={gif} />}
      {gif && <Dbutton gif={gif} download={download} />}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default App;
