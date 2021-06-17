import "bulmaswatch/superhero/bulmaswatch.min.css";
import * as esbuild from "esbuild-wasm";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";
import CodeEditor from "./components/code-editor";
import Preview from "./components/Preview";

const App = () => {
  const [input, setInput] = useState("");
  const ref = useRef<any>();
  const [code, setCode] = useState("");
  //initialize esbuild service
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
    });
  };

  //start the service the first time it loads
  useEffect(() => {
    startService();
  }, []);

  //passes user input to the fetch plugins for transpiling and bundling
  const onClick = async () => {
    if (!ref.current) {
      return;
    }
    const result = await ref.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });
    setCode(result.outputFiles[0].text)
  };


  return (
    <div>
      <CodeEditor setInput={setInput} />
      <div>
        <button onClick={onClick}>submit</button>
      </div>
      <Preview code={code}/>
    </div>
  );
};

export default App;

ReactDOM.render(<App />, document.querySelector("#root"));
