import { MarkdownRenderChild, MarkdownRenderer, App, Modal } from "obsidian";

export class YesterdayMedia extends MarkdownRenderChild {
  
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

  export class ImageModal extends Modal {
    imgSrc: string;

    constructor(app: App, imgSrc: string) {
        super(app);
        this.imgSrc = imgSrc;
    }

    onOpen() {
      let {contentEl} = this;
      let imgEl = contentEl.createEl('img', {
          attr: {
              src: this.imgSrc,
              style: 'width: 100%; height: 100%; object-fit: contain; object-position: center;'
          }
      });

      this.modalEl.style.width = '100%';
      this.modalEl.style.height = '100%';
      this.modalEl.style.boxShadow = 'none';

      this.modalEl.addEventListener('click', () => this.close());
  }

    onClose() {
      let { contentEl } = this;
      contentEl.empty();
    }
}