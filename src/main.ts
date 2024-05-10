import dayjs, { Dayjs } from 'dayjs';
import { App, MarkdownRenderer, Notice, Platform, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

import { YesterdayMedia, ImageModal } from "./media"
import { YesterdayDialog } from "./dialogs"
import { mediaExtensions } from './constants';

interface YesterdaySettings {
	colorMarkdownFiles: boolean;
	hideMediaFiles: boolean;
	showTodoCount: boolean;
	showMediaGrid: boolean;
	maximizeMedia: boolean;
	datePropFormat: string;
	startOfNextDay: number;
}

const DEFAULT_SETTINGS: YesterdaySettings = {
	colorMarkdownFiles: true,
	hideMediaFiles: false,
	showTodoCount: false,
	showMediaGrid: true,
	maximizeMedia: true,
	datePropFormat: 'YYYY-MM-DD HH:mm:ss Z',
	startOfNextDay: 5,
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
	}

	// Creates icons in the left ribbon
	addRibbonIcons() {
		const newEntryRibbon = this.addRibbonIcon('create-new', 'Create entry', (evt: MouseEvent) => {
			this.createEntry();
		});

		const toggleTodoRibbon = this.addRibbonIcon('checkmark', 'Toggle draft/complete', (evt: MouseEvent) => {
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
			name: 'Toggle draft/complete',
			callback: () => {
				this.toggleTodo();
			}
		});
	}

	handleImageClicks() {
		if (!Platform.isMobile) {
			this.registerDomEvent(document, 'click', (event: MouseEvent) => {
				let target = event.target as HTMLElement;

				if (
					target.tagName === 'IMG' &&
					target.closest('.media-embed') &&
					this.settings.maximizeMedia
				) {
					let imgSrc = (target as HTMLImageElement).src;
					new ImageModal(this.app, imgSrc).open();
				}
			});
		}
	}

	inDream = false;
	dreamContent = "";
	dreamParagraphsToRemove: Element[] = [];

	inTodo = false;
	todoContent = "";
	todoParagraphsToRemove: HTMLElement[] = [];

	registerMarkdownPostProcessors() {
		this.registerMarkdownPostProcessor((element, context) => {
			const elements = Array.from(element.querySelectorAll("p, hr"));

			elements.forEach((element) => {
				let text: string;
				if (element.tagName === "HR") {
					text = "---";
				} else if (element.tagName === "P") {
					text = (element as HTMLElement).innerText.trim();
				}

				const isMedia = text[0] === "/" && mediaExtensions.some(extension => text.endsWith(extension));
				const isComment = text.startsWith("///");
				const isDialog = text.startsWith(".") && text.contains(":");
				const isDreamStart = text.startsWith("§§§");
				const isDreamEnd = text.endsWith("§§§");
				const isTodoStart = text.startsWith("++");
				const isTodoEnd = text.endsWith("++");

				if (isMedia) {
					context.addChild(new YesterdayMedia((element as HTMLElement), text));
				}

				if (isComment) {
					element.parentElement.addClass("yesterday-comment");
				}

				if (isDialog) {
					context.addChild(new YesterdayDialog((element as HTMLElement), text));
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
						this.dreamParagraphsToRemove.push(element);
					}
				}

				if (isDreamEnd) {
					this.inDream = false;
					this.dreamParagraphsToRemove.forEach(element => {
						element.remove();
					});
					const container = element.createDiv();
					MarkdownRenderer.renderMarkdown(this.dreamContent, container, null, this);
					element.replaceWith(container);
				}

				if (isTodoStart) {
					element.parentElement.addClass("yesterday-todo");
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
		const path = getPath(this.settings.startOfNextDay);
		const now = dayjs();
		const fileName = path + "/" + now.format('YYYY-MM-DD - HH-mm-ss') + ".md";
		new Notice("Creating " + fileName);

		const frontmatter = await createFrontmatter(now.format(this.settings.datePropFormat), this);
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
		this.setHideMediaClasses();
		this.setColorClasses();
	}

	setHideMediaClasses() {
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

	setGridClasses() {
		if (this.settings.showMediaGrid) {
			document.body.classList.add('enable-media-grid');
		} else {
			document.body.classList.remove('enable-media-grid');
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function getPath(startOfNextDay: number) {
	const now = dayjs();
	if (now.hour() < startOfNextDay) {
		return pathFromDate(now.subtract(1, 'day'));
	} else {
		return pathFromDate(now);
	}
}

function pathFromDate(date: Dayjs) {
	const root = this.app.vault.getRoot().path;

	const components = [
		date.year().toString().substring(0, 3) + '0s',
		date.format('YYYY'),
		date.format('YYYY-MM'),
		date.format('YYYY-MM-DD'),
	].join("/");

	return root + components;
}

async function createFrontmatter(datetime: string, _plugin: Yesterday): Promise<string> {
	return `---\ndate: ${datetime}\n---\n\n`
}

async function runCommand(command: string) {
	const util = require('util');
	const exec = util.promisify(require('child_process').exec);
	const { stdout } = await exec(command);

	return stdout
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

		new Setting(containerEl)
			.setName('Color entries')
			.setDesc('Highlights open and resolved entries in different colors')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.colorMarkdownFiles)
				.onChange(async (value) => {
					this.plugin.settings.colorMarkdownFiles = value;
					await this.plugin.saveSettings();
					this.plugin.setColorClasses();
				}));

		new Setting(containerEl)
			.setName('Hide media files')
			.setDesc('Only show markdown files in the file explorer')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.hideMediaFiles)
				.onChange(async (value) => {
					this.plugin.settings.hideMediaFiles = value;
					await this.plugin.saveSettings();
					this.plugin.setHideMediaClasses();
				}));

		new Setting(containerEl)
			.setName('Show open entry count')
			.setDesc('Shows the number of open entries in the status bar (only on desktop)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showTodoCount)
				.onChange(async (value) => {
					this.plugin.settings.showTodoCount = value;
					await this.plugin.saveSettings();
					this.plugin.setStatusBar();
				}));

		new Setting(containerEl)
			.setName('Start of next day')
			.setDesc('In hours after midnight')
			.addSlider(toggle => toggle
				.setLimits(0, 23, 1)
				.setValue(this.plugin.settings.startOfNextDay)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.startOfNextDay = value;
					await this.plugin.saveSettings();
					this.plugin.setStatusBar();
				}));

		containerEl.createEl('br');
		const mediaSection = containerEl.createEl('div', { cls: 'setting-item setting-item-heading' });
		const mediaSectionInfo = mediaSection.createEl('div', { cls: 'setting-item-info' });
		mediaSectionInfo.createEl('div', { text: 'Media', cls: 'setting-item-name' });

		new Setting(containerEl)
			.setName('Show media files in a grid')
			.setDesc('Shows media files that are not separated by a new line in a grid')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showMediaGrid)
				.onChange(async (value) => {
					this.plugin.settings.showMediaGrid = value;
					await this.plugin.saveSettings();
					this.plugin.setGridClasses();
				}));

		new Setting(containerEl)
			.setName('Maximize image')
			.setDesc('Lets you click on an image to maximize it (only on desktop)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.maximizeMedia)
				.onChange(async (value) => {
					this.plugin.settings.maximizeMedia = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('br');
		const timeFormatSection = containerEl.createEl('div', { cls: 'setting-item setting-item-heading' });
		const timeFormatSectionInfo = timeFormatSection.createEl('div', { cls: 'setting-item-info' });
		timeFormatSectionInfo.createEl('div', { text: 'Time format', cls: 'setting-item-name' });
		const subHeading = containerEl.createDiv()
		subHeading.createEl('a', { text: 'Format documentation', href: 'https://day.js.org/docs/en/display/format' });
		containerEl.createEl('br');

		new Setting(containerEl)
			.setName('Format of \'date\' property')
			.setDesc('Format of value which will be written to \'date\' property of newly created entry')
			.addMomentFormat(toggle => toggle
				.setValue(this.plugin.settings.datePropFormat)
				.setDefaultFormat(DEFAULT_SETTINGS.datePropFormat)
				.onChange(async (v) => {
					let value = v.trim()
					if (value != '') {
						this.plugin.settings.datePropFormat = value;
					} else {
						this.plugin.settings.datePropFormat = DEFAULT_SETTINGS.datePropFormat;
					}
					await this.plugin.saveSettings();
				}));
	}
}
