import Editor from "@monaco-editor/react";

interface ICodeEditor {
  setInput(value: string): void;
}

const CodeEditor: React.FC<ICodeEditor> = ({ setInput }) => {
  
  const handleEditorChange = (value:any, event:any) => {
    // here is the current value
    setInput(value);
  }

  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      onChange={handleEditorChange}
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
  );
};

export default CodeEditor;
