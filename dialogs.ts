import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";

  export class YesterdayDialog extends MarkdownRenderChild {

    text: string;
  
    constructor(containerEl: HTMLElement, text: string) {
      super(containerEl);
  
      this.text = text;
      console.log(text);
    }
  
    onload() {
      speakersMap.clear();
      lastSpeaker = null;
      lastLineElement = null;
      const lines = this.text.split("\n");
      console.log(lines);

      const dialogContainer = this.containerEl.createEl("ul");
      dialogContainer.addClass("yesterday-dialog");

      const markdownLines: string[] = lines.map(dissectDialogLine);
      console.log(markdownLines);
      
      const reduceLines = lines.reduce(dialogReducer, dialogContainer);
      console.log(reduceLines);
      
      // const container = this.containerEl.createDiv();
      // if (items.length > 1) {
      //   container.addClass("image-grid");
      // }
      // MarkdownRenderer.renderMarkdown(markdownItems.join(""), container, null, null);
      this.containerEl.replaceWith(dialogContainer);
    }
}

var speakersMap = new Map();

function createDialogLine(text: string, addClasses: string[] = []) {
  const line = createEl("li");
  var speaker: string;
  var comment: string;
  var statement: string;

  text.replace(/\.?(\w.*?)\s?(\(.*\))?:(.*)/g, function(match: string, speakerPart: string, commentPart: string, statementPart: string) {
      speaker = speakerPart;
      comment = commentPart;
      statement = statementPart;
      return "";
  });

  const speakerElement = createEl("b");
  const commentElement = createEl("i");
  const statementElement = createEl("span");

  if (speaker.toLowerCase() == "ich") {
      line.addClass("my-dialog");
  } else {
      line.addClass("their-dialog");
  }

  if (!speakersMap.has(speaker)) {
    speakersMap.set(speaker, true);
  }

  if (speakersMap.get(speaker) || comment != null) {
    if (comment == null) {
      speakerElement.appendText(speaker + ":");
      line.appendChild(speakerElement);
  } else {
    speakerElement.appendText(speaker);    
    commentElement.appendText(" " + comment + ":");
    line.appendChild(speakerElement);
    line.appendChild(commentElement);
  }
  speakersMap.set(speaker, false);
  line.appendChild(createEl("br"));
  }

  statementElement.appendText(statement);
  line.appendChild(statementElement);

  addClasses.forEach(cls => line.addClass(cls));

  return line;
}

let lastSpeaker: String = null;
let lastLineElement: HTMLLIElement = null;

function dialogReducer(previousValue: HTMLUListElement, currentValue: string) {
  const lineElement = createDialogLine(currentValue);
  const currentSpeaker = getCurrentSpeaker(currentValue); // You need to implement this
  
  if (lastSpeaker && lastSpeaker !== currentSpeaker) {
    if (lastLineElement) {
      lastLineElement.addClass("end-speech");
    }
  }

  lastSpeaker = currentSpeaker;
  lastLineElement = lineElement;

  previousValue.appendChild(lineElement);
  return previousValue;
}

function getCurrentSpeaker(line: string): string {
  let speaker = "";
  line.replace(/\.?(\w.*?)\s?(\(.*\))?:(.*)/g, function(match: string, speakerPart: string) {
    speaker = speakerPart;
    return "";
  });
  return speaker;
}

function dissectDialogLine(line: string) {

    console.log("Line: " + line);

    var speaker;
    var comment;
    var text;
    
    line.replace(/\.?(\w.*?)\s?(\(.*\))?:(.*)/g, function(match: string, speakerPart: string, commentPart: string, textPart: string) {

        speaker = speakerPart;
        comment = commentPart;
        text = textPart;
        
        return ""
    });

    console.log("Dissect: " + speaker + ", " + comment + ", " + text); //{speaker: speaker, comment: comment, text: text});

    return speaker;
}
