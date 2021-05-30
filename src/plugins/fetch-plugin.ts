import * as esbuild from "esbuild-wasm";
import localForage from "localforage";
import axios from "axios";

//Initialize local-storage
const fileCache = localForage.createInstance({
  name: "filecache",
});

(async () => {
  await fileCache.setItem("color", "red");
  const color = await fileCache.getItem("color");
  console.log(color);
})();

export const fetchPlugin = (inputCode: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        if (args.path === "index.js") {
          return {
            loader: "jsx",
            contents: inputCode,
          };
        }
        // Check to see if we have already fetched the files
        // And if it is in the cach.
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        //If it is return it immediately.
        if (cachedResult) {
          return cachedResult;
        }

        const { data, request } = await axios.get(args.path);
        //Check if args.path ends with .css file extension
        const fileType = args.path.match(/.css$/) ? "css" : "jsx";
        const escaped = data.replace(/\n/g, '').replace(/"/g,'\\"').replace(/'/g,"\\'");
        const contents =
          fileType === "css"
            ? `
        const style = document.createElement('style');
        style.innerText = '${escaped}';
        document.head.appendChild(style);
        `
            : data;

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };
        // store response in cache
        await fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};
