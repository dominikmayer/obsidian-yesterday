import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";

  export class PurpleDialog extends MarkdownRenderChild {

    text: string;
  
    constructor(containerEl: HTMLElement, text: string) {
      super(containerEl);
  
      this.text = text;
      console.log(text);
    }
  
    onload() {
      const lines = this.text.split("\n");
      console.log(lines);

      const dialogContainer = this.containerEl.createEl("ul");
      dialogContainer.addClass("purple-dialog");

      const markdownLines: string[] = lines.map(dissectDialogLine);
      console.log(markdownLines);
      
      const reduceLines = lines.reduce(dialogReducer, dialogContainer);
      console.log(reduceLines);
      
      console.log("Build: " + buildDialogLine("Trang", "schweigsam", "Hey there"));



      // const container = this.containerEl.createDiv();
      // if (items.length > 1) {
      //   container.addClass("image-grid");
      // }
      // MarkdownRenderer.renderMarkdown(markdownItems.join(""), container, null, null);
      this.containerEl.replaceWith(dialogContainer);
    }
}

  function createDialogLine(text: string) {

    const line = createEl("li");

      var speaker: string;
      var comment: string;
      var statement: string;
      
      text.replace(/\.?(\w.*?)\s?(\(.*\))?:(.*)/g, function(match: string, speakerPart: string, commentPart: string, statementPart: string) {
  
          speaker = speakerPart;
          comment = commentPart;
          statement = statementPart;
          
          return ""
      });

      const speakerElement = createEl("b");
      const commentElement = createEl("i");
      const statementElement = createEl("span");

      if (speaker.toLowerCase() == "ich") {
        line.addClass("my-dialog");
      } else {
          line.addClass("their-dialog");
      }

      if (comment == null) {
          speaker = speaker + ":";
      } else {
          comment = " " + comment + ":";
      }

      speakerElement.appendText(speaker);
      commentElement.appendText(comment);
      statementElement.appendText(statement);

      line.appendChild(speakerElement);
      if (comment) {
        line.appendChild(commentElement);
      }
      line.appendChild(createEl("br"));
      line.appendChild(statementElement);
      
    return line;
}

function dialogReducer(previousValue: HTMLUListElement, currentValue: string) {
    const update: HTMLUListElement = previousValue;
    console.log(previousValue.className);
    update.appendChild(createDialogLine(currentValue));

    return update
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

    // const colonSplit = line.substring(1).split(":");
    // const speakerDetails = colonSplit.first() .trim(")").split("(");
    // const speaker = speakerDetails.first();
    // const [, ...action] = speakerDetails;
    // console.log("Speaker: " + speaker);
    // console.log("Action: " + action);
    // const [, ...spoken] = colonSplit;
    // console.log("Spoken: " + spoken);
    // console.log("Spoken joined: " + spoken.join(":"));
    // return {speaker: }
}

function buildDialogLine(speaker: string, comment: string, text: string) {
    return "build"
}
