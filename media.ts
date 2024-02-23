import { MarkdownRenderChild, MarkdownRenderer, App, Modal } from "obsidian";

/**
 * Renders markdown images within a specified container element.
 */
export class YesterdayMedia extends MarkdownRenderChild {

  constructor(containerEl: HTMLElement, private text: string) {
    super(containerEl);
  }

  /**
   * On load, process the text to create and display markdown images.
   */
  onload() {
    const items = this.text.split("\n").filter(text => text.length > 0);
    const markdownItems = items.map(YesterdayMedia.createMarkdownImage);

    const container = this.containerEl.createDiv();
    // if (items.length > 1) {
    container.addClass("image-grid");
    // }
    MarkdownRenderer.renderMarkdown(markdownItems.join(""), container, null, null);
    this.containerEl.replaceWith(container);
  }

  /**
   * Converts a text line into markdown image syntax.
   * @param {string} text - The text to convert.
   * @returns {string} - The markdown image string.
   */
  private static createMarkdownImage(text: string): string {
    return `![[${text.substring(1)}]]`;
  }
}

/**
 * Modal for displaying an image.
 */
export class ImageModal extends Modal {
  constructor(app: App, private imgSrc: string) {
    super(app);
  }

  /**
   * Called when the modal is opened. Sets up the image and modal styles.
   */
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('img', {
      attr: {
        src: this.imgSrc,
        style: 'width: 100%; height: 100%; object-fit: contain; object-position: center;'
      }
    });

    Object.assign(this.modalEl.style, {
      width: '100%',
      height: '100%',
      boxShadow: 'none'
    });

    this.modalEl.addEventListener('click', () => this.close());
  }

  /**
   * Called when the modal is closed. Cleans up by emptying the content element.
   */
  onClose() {
    this.contentEl.empty();
  }
}
