import { App, MarkdownRenderer, Notice, Plugin, PluginSettingTab, Setting, Vault, TFile } from 'obsidian';
import { YesterdayMedia, ImageModal } from "./media"
import { YesterdayDialog } from "./dialogs"

const mediaExtensions = ['jpg', 'jpeg', 'png'];

interface YesterdaySettings {
	colorMarkdownFiles: boolean;
	hideMediaFiles: boolean;
	showTodoCount: boolean;
}

const DEFAULT_SETTINGS: YesterdaySettings = {
	colorMarkdownFiles: true,
	hideMediaFiles: false,
	showTodoCount: false
}

let todoCount = 0;

export default class Yesterday extends Plugin {
	settings: YesterdaySettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcons();
		this.addCommands();
		this.handleImageClicks();
		this.addSettingTab(new YesterdaySettingTab(this.app, this));
		this.registerMarkdownPostProcessors();
		this.setStatusBar();

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	// Creates icons in the left ribbon
	addRibbonIcons() {
		const newEntryRibbon = this.addRibbonIcon('create-new', 'Create Entry', (evt: MouseEvent) => {
			this.createEntry();
		});

		const toggleTodoRibbon = this.addRibbonIcon('checkmark', 'Toggle To Do', (evt: MouseEvent) => {
			this.toggleTodo();
		});
	}

	addCommands() {
		this.addCommand({
			id: 'create-entry',
			name: 'Create entry',
			callback: () => {
				this.createEntry();
			}
		});

		this.addCommand({
			id: 'toggle-to-do',
			name: 'Toggle entry to do',
			callback: () => {
				this.toggleTodo();
			}
		});
	}

	handleImageClicks() {
		this.registerDomEvent(document, 'click', (event: MouseEvent) => {
			let target = event.target as HTMLElement;

			if (target.tagName === 'IMG' && target.closest('.media-embed')) {
				let imgSrc = (target as HTMLImageElement).src;
				new ImageModal(this.app, imgSrc).open();
			}
		});
	}

	inDream = false;
	dreamContent = "";
	dreamParagraphsToRemove: HTMLParagraphElement[] = [];

	inTodo = false;
	todoContent = "";
	todoParagraphsToRemove: HTMLParagraphElement[] = [];

	registerMarkdownPostProcessors() {
		this.registerMarkdownPostProcessor((element, context) => {
			const paragraphs = Array.from(element.querySelectorAll("p"));

			// Function to render and replace dream content
			// const renderDream = (paragraph: HTMLParagraphElement) => {
			// 	// Prepend and append formatting for blockquote
			// 	const formattedDream = `> [!info]\n>\n${dreamContent.split("\n").map(line => `> ${line}`).join("\n")}\n>`;
			// 	// Render the transformed dream markdown
			// 	MarkdownRenderer.renderMarkdown(formattedDream, paragraph, context.sourcePath, null);
			// 	// Clear dream content after rendering
			// 	dreamContent = "";
			// };

			paragraphs.forEach((paragraph, index) => {
				const text = paragraph.innerText.trim();

				const isImage = text[0] === "/" && mediaExtensions.some(extension => text.endsWith(extension));
				const isComment = text.startsWith("///");
				const isDialog = text.startsWith(".") && text.contains(":");
				const isDreamStart = text.startsWith("§§§");
				const isDreamEnd = text.endsWith("§§§");
				const isTodoStart = text.startsWith("++");
				const isTodoEnd = text.endsWith("++");

				if (isImage) {
					context.addChild(new YesterdayMedia(paragraph, text));
				}

				if (isComment) {
					paragraph.parentElement.addClass("yesterday-comment");
				}

				if (isDialog) {
					context.addChild(new YesterdayDialog(paragraph, text));
				}

				if (isDreamStart && !this.inDream) {
					this.inDream = true;
					this.dreamContent = "> [!yesterday-dream] Dream\n";
				}

				if (this.inDream) {
					let textWithoutMarkers = text.replace(/^§§§|§§§$/g, '').trim();
					this.dreamContent += `> ${textWithoutMarkers}\n`;
					if (!isDreamEnd) {
						this.dreamContent += `> \n`;
						this.dreamParagraphsToRemove.push(paragraph);
					}
				}

				if (isDreamEnd) {
					this.inDream = false;
					this.dreamParagraphsToRemove.forEach(element => {
						element.remove();
					});
					const container = paragraph.createDiv();
					MarkdownRenderer.renderMarkdown(this.dreamContent, container, null, null);
					paragraph.replaceWith(container);
				}

				if (isTodoStart) {
					paragraph.parentElement.addClass("yesterday-todo");
				}
			});
		});
	}

	updateTodoCount() {
		// Reset todoCount
		todoCount = 0;
	
		// Calculate todoCount based on current vault state
		const files = this.app.vault.getMarkdownFiles();
		files.forEach(file => {
			if (file.basename.toLowerCase().includes('todo')) {
				todoCount++;
			}
		});
	
		// Update the status bar item if it exists
		if (this.statusBarTodoCount) {
			this.updateStatusBarTodoCount();
		}
	}

	updateStatusBarTodoCount() {
		if (!this.statusBarTodoCount) return;
	
		let text: String;
		if (todoCount === 1) {
			text = ' open entry';
		} else {
			text = ' open entries';
		}
		this.statusBarTodoCount.setText(todoCount.toString() + text);
	}

	statusBarTodoCount: HTMLElement;

	setStatusBar() {
		if (this.settings.showTodoCount) {
			if (!this.statusBarTodoCount) {
				this.statusBarTodoCount = this.addStatusBarItem();
				// Make sure todoCount is up to date before displaying it
				this.updateTodoCount();
				// Assuming registerFileOperations is adapted to avoid adding listeners multiple times
				this.registerFileOperations();
			}
		} else {
			if (this.statusBarTodoCount) {
				this.statusBarTodoCount.remove();
				this.statusBarTodoCount = null; // Ensure it's set to null after removing
			}
			// No need to recalculate todoCount here since the status bar item is being hidden
		}
	}

	todoEventListenersAdded: boolean = false;

	registerFileOperations() {

		if (this.todoEventListenersAdded) return

		this.registerEvent(
			this.app.vault.on('create', file => {
				if (file instanceof TFile && file.extension === 'md' && file.basename.toLowerCase().includes('todo')) {
					// A new Markdown file with "todo" in the file name was created
					todoCount++;
					this.updateStatusBarTodoCount();
				}
			})
		);

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile && file.extension === 'md') {
					const oldNameIncludedTodo = oldPath.toLowerCase().includes('todo');
					const newNameIncludesTodo = file.basename.toLowerCase().includes('todo');

					if (oldNameIncludedTodo && !newNameIncludesTodo) {
						// A Markdown file with "todo" in the file name was renamed and doesn't include "todo" anymore
						todoCount--;
						this.updateStatusBarTodoCount();
					} else if (!oldNameIncludedTodo && newNameIncludesTodo) {
						// A Markdown file without "todo" in the file name was renamed and does now include "todo"
						todoCount++;
						this.updateStatusBarTodoCount();
					}
				}
			})
		);

		this.registerEvent(
			this.app.vault.on('delete', file => {
				if (file instanceof TFile && file.extension === 'md' && file.basename.toLowerCase().includes('todo')) {
					// A Markdown file with "todo" in the file name was deleted
					todoCount--;
					this.updateStatusBarTodoCount();
				}
			})
		);

		this.todoEventListenersAdded = true;
	}

	onunload() {

	}

	async createEntry(): Promise<void> {

		const now = new Date();

		const year = now.getFullYear();
		const month = ("0" + (now.getMonth() + 1)).slice(-2);
		const day = ("0" + now.getDate()).slice(-2);
		const date = [year, month, day].join("-");

		const hours = ("0" + now.getHours()).slice(-2);
		const minutes = ("0" + now.getMinutes()).slice(-2);
		const seconds = ("0" + now.getSeconds()).slice(-2);
		const time = [hours, minutes, seconds].join("-");

		const timezoneOffsetNumber = now.getTimezoneOffset();
		const timezoneOffset = ((timezoneOffsetNumber < 0 ? '+' : '-') + pad(Math.abs(timezoneOffsetNumber / 60), 2) + ":" + pad(Math.abs(timezoneOffsetNumber % 60), 2));

		const path = getPath();
		const fileName = path + "/" + date + " - " + time + ".md";

		new Notice("Creating " + fileName);
		const frontmatter = await createFrontmatter(date + " " + hours + ":" + minutes + ":" + seconds + " " + timezoneOffset, this);
		new Notice(frontmatter);

		try {
			const pathExists = await this.app.vault.adapter.exists(path);
			if (!pathExists) {
				await this.app.vault.createFolder(path);
			}

			// If files exists, throw error
			const fileExists = await this.app.vault.adapter.exists(fileName);
			if (fileExists) {
				throw new Error("File already exists");
			}
			const file = await this.app.vault.create(fileName, frontmatter);
			this.app.workspace.activeLeaf.openFile(file);
		} catch (error) {
			new Notice(error.toString());
		}
	}

	toggleTodo() {
		const file = this.app.workspace.getActiveFile();

		if (file.extension !== "md") {
			new Notice("This is not an entry")
			return;
		}

		if (file.basename.endsWith(" - todo")) {
			const newPath = file.path.replace(" - todo", "");
			this.app.fileManager.renameFile(file, newPath);
		} else {
			const newPath = file.path.replace(file.basename, file.basename + " - todo");
			this.app.fileManager.renameFile(file, newPath);
		}
	}


	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.setMediaClasses();
		this.setColorClasses();
	}

	setMediaClasses() {
		if (this.settings.hideMediaFiles) {
			document.body.classList.add('hide-media-files');
		} else {
			document.body.classList.remove('hide-media-files');
		}
	}

	setColorClasses() {
		if (this.settings.colorMarkdownFiles) {
			document.body.classList.add('color-markdown-files');
		} else {
			document.body.classList.remove('color-markdown-files');
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function getPath() {
	const now = new Date();
	if (now.getHours() < 5) {
		const yesterday = new Date()
		yesterday.setDate(now.getDate() - 1);
		return pathFromDate(yesterday);
	} else {
		return pathFromDate(now);
	}
}

function pathFromDate(date: Date) {
	const root = this.app.vault.getRoot().path;

	const year = date.getFullYear();
	const decade = year.toString().substring(0, 3) + "0s";

	const month = ("0" + (date.getMonth() + 1)).slice(-2);
	const day = ("0" + date.getDate()).slice(-2);

	const fullMonth = [year, month].join("-");
	const fullDate = [year, month, day].join("-");

	const components = [decade, year, fullMonth, fullDate].join("/");

	return root + components;
}

async function createFrontmatter(datetime: string, plugin: Yesterday): Promise<string> {

	return `---
date: ${datetime}
---

`
}

async function runCommand(command: string) {
	const util = require('util');
	const exec = util.promisify(require('child_process').exec);
	const { stdout, stderr } = await exec(command);

	return stdout
}

function pad(number: number, length: number) {
	var str = "" + number
	while (str.length < length) {
		str = '0' + str
	}
	return str
}

class YesterdaySettingTab extends PluginSettingTab {
	plugin: Yesterday;

	constructor(app: App, plugin: Yesterday) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Configure Yesterday' });
		let p = containerEl.createEl('p', { text: 'More information on ' });
		p.createEl('a', { href: 'https://www.yesterday.md', text: 'yesterday.md' });

		new Setting(containerEl)
			.setName('Color Entries')
			.setDesc('Highlights open and resolved entries in different colors')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.colorMarkdownFiles)
				.onChange(async (value) => {
					this.plugin.settings.colorMarkdownFiles = value;
					await this.plugin.saveSettings();
					this.plugin.setColorClasses();
				}));

		new Setting(containerEl)
			.setName('Hide Media Files')
			.setDesc('Only show markdown files in the file explorer')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.hideMediaFiles)
				.onChange(async (value) => {
					this.plugin.settings.hideMediaFiles = value;
					await this.plugin.saveSettings();
					this.plugin.setMediaClasses();
				}));

		new Setting(containerEl)
			.setName('Show Open Entry Count')
			.setDesc('Shows the number of open entries in the status bar (only on desktop)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showTodoCount)
				.onChange(async (value) => {
					this.plugin.settings.showTodoCount = value;
					await this.plugin.saveSettings();
					this.plugin.setStatusBar();
				}));
	}
}