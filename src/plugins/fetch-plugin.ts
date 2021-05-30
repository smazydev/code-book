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

    build.onLoad({filter:/(^index\.js$)/}, ():esbuild.OnLoadResult => {
      return {loader:'jsx',contents:inputCode};
    });

  build.onResolve({filter:/.*/}, async (args:any) => {
    const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
      args.path
    );

    //If it is return it immediately.
    if (cachedResult) {
      return cachedResult;
    }
  })

    build.onLoad({filter: /.css$/}, async (args:any) => {
      

      const { data, request } = await axios.get(args.path);
      //Check if args.path ends with .css file extension
      const escaped = data.replace(/\n/g, '').replace(/"/g,'\\"').replace(/'/g,"\\'");
      const contents = `
      const style = document.createElement('style');
      style.innerText = '${escaped}';
      document.head.appendChild(style);
      `

      const result: esbuild.OnLoadResult = {
        loader: "jsx",
        contents,
        resolveDir: new URL("./", request.responseURL).pathname,
      };
      // store response in cache
      await fileCache.setItem(args.path, result);
      return result;
    });



      build.onLoad({ filter: /.*/ }, async (args: any) => {

        const { data, request } = await axios.get(args.path);
        //Check if args.path ends with .css file extension

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };
        // store response in cache
        await fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};
