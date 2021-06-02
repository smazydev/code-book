import Editor from "@monaco-editor/react";
import prettier from "prettier";
import parser from "prettier/parser-babel";
import {useRef} from "react";
import "./code-editor.css";

interface ICodeEditor {
  setInput(value: string): void;
}

const CodeEditor: React.FC<ICodeEditor> = ({ setInput }) => {
  const editorRef = useRef<any>(null); 
  
  const handleEditorChange = (value:any, event:any):void => {
    // here is the current value
    setInput(value);
  }
  const onEditorMount = (editor:any,monaco:any) => {
    editorRef.current = editor;
  }
  const onFormatClick = () => {
    //get current value from editor.
    const unformatted = editorRef.current.getModel().getValue();
    //format the value
    const formatted = prettier.format(unformatted,{
      parser:'babel',
      plugins:[parser],
      useTabs: false,
      semi: true,
      singleQuote: true,
    })
    //set new formatted code to editor
    editorRef.current.setValue(formatted);
  }

  return (
    <div className="editor-wrapper">
      <button className="button button-format is-primary is-small" onClick={onFormatClick}>Format</button>
    <Editor
      height="500px"
      defaultLanguage="javascript"
      onChange={handleEditorChange}
      onMount={onEditorMount}
      options={{
        wordWrap: "on",
        minimap: { enabled: false },
        showUnused: false,
        folding: false,
        lineNumbersMinChars: 3,
        fontSize: 16,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
      theme="vs-dark"
    />
    </div>
  );
};

export default CodeEditor;
