import * as esbuild from 'esbuild-wasm';
import localForage from "localforage";
import axios from "axios";

//Initialize local-storage 
const fileCache = localForage.createInstance({
  name:'filecache'
});

(async () => {
  await fileCache.setItem('color','red');
  const color = await fileCache.getItem('color');
  console.log(color);
})()


export const fetchPlugin = (inputCode:string) => {
    return {
        name: 'fetch-plugin',
        setup(build:esbuild.PluginBuild) {
        build.onLoad({ filter: /.*/ }, async (args: any) => {
        
            if (args.path === "index.js") {
              return {
                loader: "jsx",
                contents: inputCode,
              };
            }
            // Check to see if we have already fetched the files
            // And if it is in the cach.
            const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
    
            //If it is return it immediately.
            if (cachedResult) {
              return cachedResult;
            }
    
    
            const {data,request} = await axios.get(args.path);
            const result: esbuild.OnLoadResult =  {
              loader: 'jsx',
              contents: data,
              resolveDir: new URL('./',request.responseURL).pathname,
            }
            // store response in cache
            await fileCache.setItem(args.path,result);
            return result;
          });
        }
    }
}