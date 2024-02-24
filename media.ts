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

    // Create an image element
    const img = contentEl.createEl('img', {
        attr: {
            src: this.imgSrc,
            // Remove the explicit width and height setting to allow natural size
            style: 'max-width: 100%; max-height: 100%; object-fit: contain; object-position: center;'
        }
    });

    // Wait for the image to load to get its natural dimensions
    img.onload = () => {
        // Calculate the aspect ratio of the image
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        // Determine the maximum size of the modal based on the window size
        const maxWidth = window.innerWidth * 0.9; // 90% of the viewport width
        const maxHeight = window.innerHeight * 0.8; // 80% of the viewport height

        // Calculate the optimal size of the modal based on the image aspect ratio
        let modalWidth, modalHeight;
        if (aspectRatio > 1) {
            // Image is wider than it is tall
            modalWidth = Math.min(maxWidth, img.naturalWidth);
            modalHeight = modalWidth / aspectRatio;
        } else {
            // Image is taller than it is wide or square
            modalHeight = Math.min(maxHeight, img.naturalHeight);
            modalWidth = modalHeight * aspectRatio;
        }

        // Apply the calculated dimensions to the modal
        Object.assign(this.modalEl.style, {
            width: `${modalWidth}px`,
            height: `${modalHeight}px`,
            boxShadow: 'none'
        });
    };

    // Close the modal on click
    this.modalEl.addEventListener('click', () => this.close());
}

    /**
     * Called when the modal is closed. Cleans up by emptying the content element.
     */
    onClose() {
      this.contentEl.empty();
    }
  }
