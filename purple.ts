import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";

export class PurpleEmoji extends MarkdownRenderChild {
  static ALL_EMOJIS: Record<string, string> = {
    ":+1:": "👍",
    ":sunglasses:": "😎",
    ":smile:": "😄",
  };

  text: string;

  constructor(containerEl: HTMLElement, text: string) {
    super(containerEl);

    this.text = text;
  }

  onload() {
    const emojiEl = this.containerEl.createSpan({
      text: PurpleEmoji.ALL_EMOJIS[this.text] ?? this.text,
    });
    this.containerEl.replaceWith(emojiEl);
  }
}

export class PurpleImage extends MarkdownRenderChild {
    static ALL_EMOJIS: Record<string, string> = {
      ":+1:": "👍",
      ":sunglasses:": "😎",
      ":smile:": "😄",
    };
  
    text: string;
  
    constructor(containerEl: HTMLElement, text: string) {
      super(containerEl);
  
      this.text = text;
      console.log(text);
    }
  
    onload() {
      const items = this.text.split("\n");
      const markdownItems = items.map(createMarkdownImage);

      const container = this.containerEl.createDiv();
      container.addClass("image-grid");
      MarkdownRenderer.renderMarkdown(markdownItems.join("\n"), container, null, null);
      this.containerEl.replaceWith(container);
    }
  }

  function createMarkdownImage(text: string) {
    return "![[" + text.substring(1) + "]]"
  }