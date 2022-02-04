// No types is very nice

import {
  $createTextNode,
  $getRoot,
  createEditor,
  $getSelection,
} from "lexical";
// Why ParagraphNode package?
import { $createParagraphNode, ParagraphNode } from "lexical/ParagraphNode";

document.addEventListener("DOMContentLoaded", () => {
  // Page
  const body = document.body;
  const rootElement = document.createElement("div");
  rootElement.style.border = "1px solid blue";
  rootElement.contentEditable = "true";
  body.append(rootElement);

  // Editor
  const editor = createEditor();
  editor.addListener("error", (e) => {
    throw new Error(e);
  });
  editor.setRootElement(rootElement);
  // This should come by default because I just forgot to register paragraph
  editor.registerNodes([ParagraphNode]);
  handleEvents(editor);
  editor.update(() => {
    const paragraph = $createParagraphNode();
    $getRoot().append(paragraph);
    paragraph.select();
  });
  editor.update(() => {
    const text = $createTextNode("foo");
    $getRoot().getFirstChild().append(text);
  });
});

// Really? I have to copy-paste that from usePlainTextSetup?
function handleEvents(editor) {
  editor.addListener(
    "command",
    (type, payload) => {
      const selection = $getSelection();
      if (selection === null) {
        return false;
      }
      switch (type) {
        case "deleteCharacter": {
          const isBackward = payload;
          selection.deleteCharacter(isBackward);
          return true;
        }
        case "deleteWord": {
          const isBackward = payload;
          selection.deleteWord(isBackward);
          return true;
        }
        case "deleteLine": {
          const isBackward = payload;
          selection.deleteLine(isBackward);
          return true;
        }
        case "insertText": {
          const eventOrText = payload;
          if (typeof eventOrText === "string") {
            selection.insertText(eventOrText);
          } else {
            const dataTransfer = eventOrText.dataTransfer;
            if (dataTransfer != null) {
              $insertDataTransferForPlainText(dataTransfer, selection);
            } else {
              const data = eventOrText.data;
              if (data) {
                selection.insertText(data);
              }
            }
          }
          return true;
        }
        case "removeText":
          selection.removeText();
          return true;
        case "insertLineBreak":
          const selectStart = payload;
          selection.insertLineBreak(selectStart);
          return true;
        case "insertParagraph":
          selection.insertLineBreak();
          return true;
        case "indentContent":
        case "outdentContent":
        case "insertHorizontalRule":
        case "insertImage":
        case "insertTable":
        case "formatElement":
        case "formatText": {
          return true;
        }
        case "keyArrowLeft": {
          const event = payload;
          const isHoldingShift = event.shiftKey;
          if ($shouldOverrideDefaultCharacterSelection(selection, true)) {
            event.preventDefault();
            $moveCharacter(selection, isHoldingShift, true);
            return true;
          }
          return false;
        }
        case "keyArrowRight": {
          const event = payload;
          const isHoldingShift = event.shiftKey;
          if ($shouldOverrideDefaultCharacterSelection(selection, false)) {
            event.preventDefault();
            $moveCharacter(selection, isHoldingShift, false);
            return true;
          }
          return false;
        }
        case "keyBackspace": {
          const event = payload;
          event.preventDefault();
          return editor.execCommand("deleteCharacter", true);
        }
        case "keyDelete": {
          const event = payload;
          event.preventDefault();
          return editor.execCommand("deleteCharacter", false);
        }
        case "keyEnter": {
          const event = payload;
          event.preventDefault();
          return editor.execCommand("insertLineBreak");
        }
        case "clearEditor": {
          clearEditor(editor);
          return false;
        }
        case "copy": {
          const event = payload;
          onCopyForPlainText(event, editor);
          return true;
        }
        case "cut": {
          const event = payload;
          onCutForPlainText(event, editor);
          return true;
        }
        case "paste": {
          const event = payload;
          onPasteForPlainText(event, editor);
          return true;
        }
        case "drop":
        case "dragstart": {
          // TODO: Make drag and drop work at some point.
          const event = payload;
          event.preventDefault();
          return true;
        }
      }
      return false;
    },
    0
  );
}
