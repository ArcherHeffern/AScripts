import './App.css'
import { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import Editor from '@monaco-editor/react';

function isSpace(c: string) {
  return /\s/.test(c)
}

const PAREN_MATCHES = {
  "(": ")",
  "[": "]",
  "{": "}",
}

function _format(s: string): { "result": string, "error_msg": string } {
  let indentation = 0
  let in_word = false
  let line = 1
  let char = 1

  let ret = ""
  let err: string = ""

  let i = 0
  while (i < s.length) {
    let c = s[i]
    if (c == "\"" || c == "'") {
      in_word = !in_word
    } else if (in_word) {
      ;
    } else if (c == "\\") {
      i += 1
      char += 1
      ret += c
      c = s[i]
      ret += c
    }

    if (c == "}" || c == "]" || c == ")") {
      indentation -= 1
      if (indentation < 0) {
        err += `Parenthesis are not balanced at ${line}:${char}.\n`
        indentation = 0
      }
      ret += "\n" + "\t".repeat(indentation)
    }

    if (!isSpace(c)) {
      ret += c
    }

    if (c == "{" || c == "[" || c == "(") {
      // Edge case: I don't want to format () as 
      // (
      //    
      // )
      // Solution: Find next non space character. If closing, don't bother formatting! 
      let temp_i = i + 1
      while (temp_i < s.length && isSpace(s[temp_i])) {
        temp_i += 1
      }
      if (temp_i < s.length && PAREN_MATCHES[c] == s[temp_i]) {
        i = temp_i
        ret += PAREN_MATCHES[c]
      } else {
        indentation += 1
        ret += "\n" + "\t".repeat(indentation)
      }
    } else if (c == ",") {
      ret += "\n" + "\t".repeat(indentation)
    } else if (c == "\n") {
      line += 1
      char = 0
    }

    i += 1

  }
  if (indentation != 0) {
    err += "Indentation must be 0 at the end. Parenthesis are not balanced!\n"
  }
  return {
    result: ret,
    error_msg: err,
  }
}


function App() {

  function aformat() {
    const { result: formattedOldCode, error_msg: oldCodeFormattingErrorMsg } = _format(oldCode)
    const { result: formattedNewCode, error_msg: newCodeFormattingErrorMsg } = _format(newCode)

    if (formattedOldCode != oldCode) {
      setOldCodeFormattingErrorMsg(oldCodeFormattingErrorMsg)
      setOldCode(formattedOldCode)
    }

    if (formattedNewCode != newCode) {
      setNewCodeFormattingErrorMsg(newCodeFormattingErrorMsg)
      setNewCode(formattedNewCode)
    }

    if (formattedOldCode != oldCode || formattedNewCode != newCode) {
      setNewCodePreFormatting(newCode)
      setOldCodePreFormatting(oldCode)
    }
  }

  function reset() {
    setOldCode("")
    setOldCodePreFormatting("")
    setOldCodeFormattingErrorMsg("")

    setNewCode("")
    setNewCodePreFormatting("")
    setNewCodeFormattingErrorMsg("")
  }

  function undoFormatting() {
    setOldCode(oldCodePreFormatting)
    setOldCodePreFormatting("")
    setNewCode(newCodePreFormatting)
    setNewCodePreFormatting("")
  }

  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [oldCodePreFormatting, setOldCodePreFormatting] = useState<string>("");
  const [newCodePreFormatting, setNewCodePreFormatting] = useState<string>("");
  const [oldCodeFormattingErrorMsg, setOldCodeFormattingErrorMsg] = useState<string>("");
  const [newCodeFormattingErrorMsg, setNewCodeFormattingErrorMsg] = useState<string>("");

  return (
    <>
      <h1>ADiffTool</h1>
      <button onClick={reset}>Reset</button>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Editor height="50vh" defaultLanguage="javascript" onChange={(s: string | undefined) => { setOldCode(s || "") }} value={oldCode} />
          <div>{oldCodeFormattingErrorMsg}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Editor height="50vh" defaultLanguage="javascript" onChange={(s: string | undefined) => setNewCode(s || "")} value={newCode} />
          <div>{newCodeFormattingErrorMsg}</div>
        </div>
      </div>
      <button onClick={aformat}>AFormat</button>
      <button onClick={undoFormatting} disabled={!(oldCodePreFormatting || newCodePreFormatting)}>Undo Formatting</button>
      <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />
    </>
  )
}

export default App
