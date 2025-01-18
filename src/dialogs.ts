import { create } from "domain";
import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";

export class YesterdayDialog extends MarkdownRenderChild {
  text: string;
  speakersMap = new Map<string, string>();
  userSpeakers = [ // List of user speaker identifiers
    "أنا", // Arabic
    "আমি", // Bengali
    "我", // Chinese
    "ik", // Dutch
    "me", // English
    "minä", "mä", // Finnish
    "moi", // French
    "ich", // German
    "εγώ", // Greek
    "אני", // Hebrew
    "मैं", // Hindi
    "aku", "saya", // Indonesian
    "私", "わたし", // Japanese
    "나", "저", // Korean
    "ego", // Latin
    "saya", "aku", // Malay
    "jeg", // Norwegian
    "من", // Persian
    "ja", // Polish
    "eu", // Portuguese
    "ਮੈਂ", // Punjabi
    "я", // Russian
    "yo", // Spanish
    "jag", // Swedish
    "ako", // Tagalog
    "ฉัน", "ผม", // Thai
    "میں", // Urdu
    "tôi", "mình" // Vietnamese
  ];

  allSpeakers: Set<string> = new Set();
  lastSpeakerByType: Map<string, string> = new Map();
  lastSpeaker: string = null;
  lastLineElement: HTMLLIElement = null;

  constructor(containerEl: HTMLElement, text: string) {
    super(containerEl);
    this.text = text;
  }

  onload() {
    this.speakersMap.clear();
    this.allSpeakers.clear();
    this.lastSpeakerByType.clear();
    
    let lines = this.text.split("\n.");
    lines = lines.map((entry, index) => (index === 0 ? entry : '.' + entry));

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
    const lastSpeakerOfType = this.lastSpeakerByType.get(dialogType);
    const showSpeaker = !lastSpeakerOfType || lastSpeakerOfType !== speaker.toLowerCase();
    const hasComment = comment !== "";

    const line = document.createElement("li");

    const speakerElement = createEl("span");
    speakerElement.addClass("dialog-speaker");

    const statementElement = createEl("p");
    statementElement.addClass("dialog-statement");

    line.classList.add(dialogType);

    if (showSpeaker || hasComment) {
      const metaElement = createEl("p");
      metaElement.addClass("dialog-meta");
      line.appendChild(metaElement);

      if (showSpeaker) {
        speakerElement.textContent = `${speaker}`;
        metaElement.appendChild(speakerElement);
      }
      if (hasComment) {
        const commentElement = createEl("span");
        commentElement.addClass("dialog-comment");
        commentElement.textContent = `${comment}`;
        metaElement.appendChild(commentElement);
      }
    }

    if (this.isOnlyEmoji(statement)) {
      line.classList.add("emoji-only");
    }

    statementElement.innerHTML = statement.replace(/\n/g, "<br>");
    line.appendChild(statementElement);
    
    this.lastSpeakerByType.set(dialogType, speaker.toLowerCase());

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
    const regex = /^\.([^:(]+)(?:\s?\((.*?)\))?:\s?((?:.|\n)*)/;
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