import * as esbuild from "esbuild-wasm";
import {useState,useEffect,useRef} from "react";
import ReactDOM from "react-dom";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import {fetchPlugin} from "./plugins/fetch-plugin";
import CodeEditor from "./components/code-editor";

const App = () => {

    const [input,setInput] = useState("");
    const ref = useRef<any>();
    const iFrameRef = useRef<any>();

    //initialize esbuild service
    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm"
        });
    };

    //start the service the first time it loads
    useEffect(()=>{
        startService();
    },[]);

    //passes user input to the fetch plugins for transpiling and bundling
    const onClick = async () => {
        if (!ref.current) {
            return;
        }
        iFrameRef.current.srcdoc = html
        const result = await ref.current.build({
            entryPoints:['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(),fetchPlugin(input)],
            define:{
                'process.env.NODE_ENV':'"production"',
                global: 'window',
            }
        })
        iFrameRef.current.contentWindow.postMessage(result.outputFiles[0].text,'*');
    };

    const html = `
        <html>
        <head></head>
        <body>
        <div id="root"></div>
        <script>
        window.addEventListener('message',(event) => {
            try {
            eval(event.data);
            } catch (err) {
                const root = document.querySelector('#root');
                root.innerHTML = '<div style="color:red";><h4>Runtime Error</h4>'+ err +'</div>'
                console.error(err);
            }
        },false);
        </script>
        </body>
        <html>
    `;

    return (
        <div>
            <CodeEditor setInput={setInput}
            />
            <textarea value={input} onChange={e => setInput(e.target.value)}></textarea>
            <div>
                <button onClick={onClick}>submit</button>
            </div>
            <iframe title="code preview"ref={iFrameRef} sandbox="allow-scripts" srcDoc={html} /> 
        </div>
    )
}

export default App;


ReactDOM.render(<App/>,document.querySelector("#root"));