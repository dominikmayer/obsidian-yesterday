import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";

export class YesterdayImage extends MarkdownRenderChild {
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
      const items = this.text.split("\n");
      const markdownItems = items.map(createMarkdownImage);

      const container = this.containerEl.createDiv();
      if (items.length > 1) {
        container.addClass("image-grid");
      }
      MarkdownRenderer.renderMarkdown(markdownItems.join(""), container, null, null);
      this.containerEl.replaceWith(container);
    }
  }

  function createMarkdownImage(text: string) {
      if (text.length == 0) {
          return ""
      } else {
        return "![[" + text.substring(1) + "]]"
      }
  }