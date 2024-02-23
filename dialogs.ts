import { MarkdownRenderChild } from "obsidian";

// Define a class to handle dialog rendering in Markdown
export class YesterdayDialog extends MarkdownRenderChild {
  text: string;
  speakersMap = new Map<string, boolean>();
  lastSpeaker: string | null = null;
  lastLineElement: HTMLElement | null = null;

  constructor(containerEl: HTMLElement, text: string) {
    super(containerEl);
    this.text = text;
  }

  // Called when the component is loaded
  onload() {
    this.initializeDialog();
  }

  // Initializes dialog processing
  initializeDialog() {
    this.speakersMap.clear();
    this.lastSpeaker = null;
    this.lastLineElement = null;

    const lines = this.text.split("\n");
    const dialogContainer = this.containerEl.createEl("ul", { cls: "yesterday-dialog" });

    lines.forEach(line => {
      if (line.trim()) {
        const lineElement = this.createDialogLine(line);
        dialogContainer.appendChild(lineElement);
      }
    });

    this.containerEl.replaceWith(dialogContainer);
  }

// Creates a dialog line element
createDialogLine(text: string): HTMLElement {
  const line = createEl("li");
  let [speaker, comment, statement] = this.dissectDialogLine(text);

  // Determine if the speaker or comment has changed to decide on displaying them
  const showSpeakerOrComment = !this.speakersMap.get(speaker) || comment;
  if (showSpeakerOrComment) {
      if (comment) {
          const speakerElement = createEl("b", { text: speaker });
          const commentElement = createEl("i", { text: ` ${comment.trim()}:` }); // Ensure comment is in italics
          line.appendChild(speakerElement);
          line.appendText(" "); // Add space between speaker and comment
          line.appendChild(commentElement);
      } else {
          line.appendChild(createEl("b", { text: `${speaker}:` }));
      }
      line.appendChild(createEl("br")); // Ensure line break after speaker/comment
  }

  this.speakersMap.set(speaker, true); // Mark the speaker as shown

  const statementElement = createEl("span", { text: statement });
  line.appendChild(statementElement);

  if (speaker.toLowerCase() === "ich") {
      line.addClass("my-dialog");
  } else {
      line.addClass("their-dialog");
  }

  return line;
}

  // Parses the dialog line to extract speaker, comment, and statement
  dissectDialogLine(line: string): [string, string, string] {
    const match = line.match(/\.?(\w.*?)\s?(\(.*\))?:(.*)/);
    if (!match) return ["", "", ""]; // Return empty parts if the line does not match the expected format
    return [match[1], match[2] || "", match[3]];
  }
}
