import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";

export class YesterdayDialog extends MarkdownRenderChild {
  text: string;
  speakersMap = new Map<string, string>();
  userSpeakers = ["ich", "me", "je"]; // List of user speaker identifiers
  allSpeakers: Set<string> = new Set();
  spokenYet: Set<string> = new Set();
  lastSpeaker: string = null;
  lastLineElement: HTMLLIElement = null;

  constructor(containerEl: HTMLElement, text: string) {
    super(containerEl);
    this.text = text;
  }

  onload() {
    this.speakersMap.clear();
    this.allSpeakers.clear();
    const lines = this.text.split("\n");

    const dialogContainer = this.containerEl.createEl("ul");
    dialogContainer.addClass("yesterday-dialog");

    // First pass to collect all speakers
    lines.forEach(line => {
      const { speaker } = this.dissectDialogLine(line);
      if (speaker) this.allSpeakers.add(speaker.toLowerCase());
    });

    // Determine dialog roles before creating lines
    this.determineSpeakerRoles();

    // Second pass to create and append dialog lines
    lines.forEach(line => {
      const lineElement = this.createDialogLine(line);
      if (lineElement) dialogContainer.appendChild(lineElement);
    });

    this.containerEl.replaceWith(dialogContainer);
  }

  determineSpeakerRoles() {
    const speakers = Array.from(this.allSpeakers);
    if (speakers.some(speaker => this.userSpeakers.includes(speaker))) {
      // If any known user speaker names are found, mark them as "my-dialog"
      speakers.forEach(speaker => {
        this.speakersMap.set(speaker, this.userSpeakers.includes(speaker) ? "my-dialog" : "their-dialog");
      });
    } else {
      // Default to the first as "their-dialog", the second as "my-dialog", if more than two, others as "their-dialog"
      speakers.forEach((speaker, index) => {
        const dialogType = index === 1 ? "my-dialog" : "their-dialog";
        this.speakersMap.set(speaker, dialogType);
      });
    }
  }

  createDialogLine(text: string) {
    const { speaker, comment, statement } = this.dissectDialogLine(text);
    if (!speaker) return null; // Skip lines without a speaker

    const dialogType = this.speakersMap.get(speaker.toLowerCase()) || "their-dialog";
    const showSpeaker = !this.spokenYet.has(speaker.toLowerCase()) || comment !== "";

    const line = document.createElement("li");
    const speakerElement = createEl("b");
    const commentElement = createEl("i");
    const statementElement = createEl("span");

    line.classList.add(dialogType);

    // Construct the line content. Implementation depends on your format
    if (showSpeaker) {
      if (comment === "") {
        speakerElement.textContent = `${speaker}:`;
        line.appendChild(speakerElement);
      } else {
        speakerElement.textContent = `${speaker}`;
        commentElement.textContent = ` (${comment}):`;
        line.appendChild(speakerElement);
        line.appendChild(commentElement);
      }
      line.appendChild(createEl("br"));
    } else {
      if (this.isOnlyEmoji(statement)) {
        line.classList.add("emoji-only");
      }
    }
    statementElement.textContent = ` ${statement}`;
    line.appendChild(statementElement);
    this.spokenYet.add(speaker.toLowerCase());

    if (this.lastSpeaker && this.lastSpeaker !== speaker) {
      if (this.lastLineElement) {
        this.lastLineElement.addClass("end-speech");
      }
    }

    this.lastSpeaker = speaker;
    this.lastLineElement = line;

    return line;
  }

  dissectDialogLine(line: string): { speaker: string; comment: string; statement: string } {
    const regex = /\.?(.*?)(?:\s?\((.*?)\))?:\s?(.*)/;
    const match = line.match(regex);
    if (match) {
      const [_, speaker, comment = '', statement] = match;
      return { speaker: speaker.trim(), comment: comment.trim(), statement: statement.trim() };
    }
    return { speaker: "", comment: "", statement: "" };
  }

  isOnlyEmoji(str: string) {
    // This regex pattern matches common emoji characters but is not exhaustive.
    // It includes ranges for emoji, including some common variations and skin tones.
    const emojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{1F004}\u{1F0CF}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{1F3FB}-\u{1F3FF}]+$/gu;

    return emojiRegex.test(str);
  }
}
