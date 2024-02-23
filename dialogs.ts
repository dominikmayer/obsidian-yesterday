import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";

export class YesterdayDialog extends MarkdownRenderChild {

  text: string;
  speakersMap = new Map();
  lastSpeaker: string = null;
  lastLineElement: HTMLLIElement = null;

  constructor(containerEl: HTMLElement, text: string) {
    super(containerEl);

    this.text = text;
  }

  onload() {
    this.speakersMap.clear();
    this.lastSpeaker = null;
    this.lastLineElement = null;
    const lines = this.text.split("\n");

    const dialogContainer = this.containerEl.createEl("ul");
    dialogContainer.addClass("yesterday-dialog");

    const markdownLines: string[] = lines.map(dissectDialogLine);

    // Binding the reducer to the current instance
    const reduceLines = lines.reduce((prev, curr) => this.dialogReducer(prev, curr), dialogContainer);

    // const container = this.containerEl.createDiv();
    // if (items.length > 1) {
    //   container.addClass("image-grid");
    // }
    // MarkdownRenderer.renderMarkdown(markdownItems.join(""), container, null, null);
    this.containerEl.replaceWith(dialogContainer);
  }


  createDialogLine(text: string, addClasses: string[] = []) {
    const line = createEl("li");
    var speaker: string;
    var comment: string;
    var statement: string;

    text.replace(/\.?(\w.*?)\s?(\(.*\))?:(.*)/g, function (match: string, speakerPart: string, commentPart: string, statementPart: string) {
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

    if (!this.speakersMap.has(speaker)) {
      this.speakersMap.set(speaker, true);
    }

    if (this.speakersMap.get(speaker) || comment != null) {
      if (comment == null) {
        speakerElement.appendText(speaker + ":");
        line.appendChild(speakerElement);
      } else {
        speakerElement.appendText(speaker);
        commentElement.appendText(" " + comment + ":");
        line.appendChild(speakerElement);
        line.appendChild(commentElement);
      }
      this.speakersMap.set(speaker, false);
      line.appendChild(createEl("br"));
    }

    statementElement.appendText(statement);
    line.appendChild(statementElement);

    addClasses.forEach(cls => line.addClass(cls));

    return line;
  }

  dialogReducer(previousValue: HTMLUListElement, currentValue: string) {
    const lineElement = this.createDialogLine(currentValue);
    const currentSpeaker = getCurrentSpeaker(currentValue);

    if (this.lastSpeaker && this.lastSpeaker !== currentSpeaker) {
      if (this.lastLineElement) {
        this.lastLineElement.addClass("end-speech");
      }
    }

    this.lastSpeaker = currentSpeaker;
    this.lastLineElement = lineElement;

    previousValue.appendChild(lineElement);
    return previousValue;
  }

}

function getCurrentSpeaker(line: string): string {
  let speaker = "";
  line.replace(/\.?(\w.*?)\s?(\(.*\))?:(.*)/g, function (match: string, speakerPart: string) {
    speaker = speakerPart;
    return "";
  });
  return speaker;
}

function dissectDialogLine(line: string) {

  var speaker;
  var comment;
  var text;

  line.replace(/\.?(\w.*?)\s?(\(.*\))?:(.*)/g, function (match: string, speakerPart: string, commentPart: string, textPart: string) {

    speaker = speakerPart;
    comment = commentPart;
    text = textPart;

    return ""
  });

  return speaker;
}
