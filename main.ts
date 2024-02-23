import { App, Notice, Plugin, PluginSettingTab, Setting, Vault, TFile } from 'obsidian';
import { YesterdayMedia, ImageModal } from "./media"
import { YesterdayDialog } from "./dialogs"

interface YesterdaySettings {
	// Define settings here if needed in the future
}

const DEFAULT_SETTINGS: YesterdaySettings = {
	// Define default settings here if needed in the future
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
			// Called when the user clicks the icon.
			this.createEntry();
		});

		const toggleTodoRibbon = this.addRibbonIcon('checkmark', 'Toggle To Do', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.toggleTodo();
		});		
	}

	addCommands() {
		this.addCommand({
			id: 'create-entry',
			name: 'Create entry',
			// hotkeys: [{ modifiers: ["Mod"], key: "n" }],
			callback: () => {
				this.createEntry();
			}
		});

		this.addCommand({
			id: 'toggle-to-do',
			name: 'Toggle entry to do',
			// hotkeys: [{ modifiers: ["Mod"], key: "t" }],
			callback: () => {
				this.toggleTodo();
			}
		});
	}

	handleImageClicks() {
		this.registerDomEvent(document, 'click', (event: MouseEvent) => {
			let target = event.target as HTMLElement;
		
			if (target.tagName === 'IMG' && target.closest('.media-embed')) {
				let imgSrc = (target as HTMLImageElement).src;
				new ImageModal(this.app, imgSrc).open();
			}
		});
	}

	registerMarkdownPostProcessors() {
		this.registerMarkdownPostProcessor((element, context) => {
			const paragraphs = element.querySelectorAll("p");
	  
			for (let index = 0; index < paragraphs.length; index++) {
			  const paragraph = paragraphs.item(index);
			  const text = paragraph.innerText.trim();
			  const mediaExtensions = ['jpg', 'jpeg', 'png'];

			  const isImage = text[0] === "/" && mediaExtensions.some(extension => text.endsWith(extension));
			  const isComment = text.startsWith("///");
			  const isDialog = text.startsWith(".") && text.contains(":");
			  const isTodo = text.startsWith("++");
			  const isDreamStart = text.startsWith("§§§");
			  const isDreamEnd = text.endsWith("§§§");

			  if (isImage) {
				  context.addChild(new YesterdayMedia(paragraph, text));
			  }

			  if (isComment) {
				  paragraph.parentElement.addClass("yesterday-comment");
			  }

			  if (isDialog) {
				context.addChild(new YesterdayDialog(paragraph, text));
			  }

			  if (isTodo) {
				paragraph.parentElement.addClass("yesterday-todo");
			  }

			  if (isDreamStart) {
				paragraph.parentElement.addClass("yesterday-dream-start");
			  }

			  if (isDreamEnd) {
				paragraph.parentElement.addClass("yesterday-dream-end");
			  }
			}
		  });
	}

	setStatusBar() {
		const statusBarTodoCount = this.addStatusBarItem();
		updateStatusBarTodoCount(statusBarTodoCount);
		this.registerFileOperations(statusBarTodoCount);
	}
	
	registerFileOperations(statusBarTodoCount: HTMLElement) {
		this.app.vault.getMarkdownFiles().forEach(file => {
			if (file.basename.toLowerCase().includes('todo')) {
				todoCount++;
			}
		});

		this.registerEvent(
			this.app.vault.on('create', file => {
				if (file instanceof TFile && file.extension === 'md' && file.basename.toLowerCase().includes('todo')) {
					// Eine neue Markdown-Datei mit "todo" im Dateinamen wurde erstellt
					todoCount++;
					updateStatusBarTodoCount(statusBarTodoCount);
				}
			})
		);
		
		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile && file.extension === 'md') {
					const oldNameIncludedTodo = oldPath.toLowerCase().includes('todo');
					const newNameIncludesTodo = file.basename.toLowerCase().includes('todo');
		
					if (oldNameIncludedTodo && !newNameIncludesTodo) {
						// Eine Datei, die "todo" im Dateinamen hatte, wurde umbenannt und enthält nun nicht mehr "todo"
						todoCount--;
						updateStatusBarTodoCount(statusBarTodoCount);
					} else if (!oldNameIncludedTodo && newNameIncludesTodo) {
						// Eine Datei, die nicht "todo" im Dateinamen hatte, wurde umbenannt und enthält nun "todo"
						todoCount++;
						updateStatusBarTodoCount(statusBarTodoCount);
					}
				}
			})
		);
		
		this.registerEvent(
			this.app.vault.on('delete', file => {
				if (file instanceof TFile && file.extension === 'md' && file.basename.toLowerCase().includes('todo')) {
					// Eine Markdown-Datei mit "todo" im Dateinamen wurde gelöscht
					todoCount--;
					updateStatusBarTodoCount(statusBarTodoCount);
				}
			})
		);
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
		const timezoneOffset = ((timezoneOffsetNumber<0? '+':'-') + pad(Math.abs(timezoneOffsetNumber/60), 2) + ":" + pad(Math.abs(timezoneOffsetNumber%60), 2));

		const path = getPath();
		const fileName = path + "/" + date + " - " + time  + ".md";
		
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
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function updateStatusBarTodoCount(barElement: HTMLElement) {
	let text: String;
		if (todoCount === 1) {
			text = ' open entry';
		} else {
			text = ' open entries';
		} 
		barElement.setText(todoCount.toString() + text);
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

function pad(number: number, length: number){
    var str = "" + number
    while (str.length < length) {
        str = '0'+str
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
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Configure Yesterday'});
		containerEl.createEl('p', {text: 'More settings coming soon.'});

		// new Setting(containerEl)
		// 	.setName('Google API Key')
		// 	.setDesc('You can get it from Google')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter your API key')
		// 		.setValue(this.plugin.settings.googleAPIKey)
		// 		.onChange(async (value) => {
		// 			console.log('Secret: ' + value);
		// 			this.plugin.settings.googleAPIKey = value;
		// 			await this.plugin.saveSettings();
		// 		}));

		// new Setting(containerEl)
		// 	.setName('DarkSky API Key')
		// 	.setDesc('You can get it from DarkSky')
		// 	.addText(text => text
		// 		.setPlaceholder('Enter your API key')
		// 		.setValue(this.plugin.settings.darkSkyApiKey)
		// 		.onChange(async (value) => {
		// 			console.log('Secret: ' + value);
		// 			this.plugin.settings.darkSkyApiKey = value;
		// 			await this.plugin.saveSettings();
		// 		}));
	}
}
