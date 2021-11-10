import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault } from 'obsidian';
import { PurpleImage } from "./purple"
import { PurpleDialog } from "./dialogs"
import { appendFile } from 'fs';


// Remember to rename these classes and interfaces!

interface PurpleSettings {
	googleAPIKey: string;
	darkSkyApiKey: string;
}

const DEFAULT_SETTINGS: PurpleSettings = {
	googleAPIKey: '',
	darkSkyApiKey: ''
}

export default class PurplePlugin extends Plugin {
	settings: PurpleSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const newEntryRibbon = this.addRibbonIcon('create-new', 'Create Entry', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.createEntry();
		});

		this.addCommand({
			id: 'create-entry',
			name: 'Create entry',
			callback: () => {
				this.createEntry();
			}
		});

		// Perform additional things with the ribbon
		newEntryRibbon.addClass('purple-ribbon-class');

		const toggleTodoRibbon = this.addRibbonIcon('checkmark', 'Toggle To Do', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.toggleTodo();
		});

		this.addCommand({
			id: 'toggle-to-do',
			name: 'Toggle entry to do',
			callback: () => {
				this.toggleTodo();
			}
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));


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
				  context.addChild(new PurpleImage(paragraph, text));
			  }

			  if (isComment) {
				  paragraph.parentElement.addClass("purple-comment");
			  }

			  if (isDialog) {
				context.addChild(new PurpleDialog(paragraph, text));
			  }

			  if (isTodo) {
				paragraph.parentElement.addClass("purple-todo");
			  }

			  if (isDreamStart) {
				paragraph.parentElement.addClass("purple-dream-start");
			  }

			  if (isDreamEnd) {
				paragraph.parentElement.addClass("purple-dream-end");
			  }
			}
		  });

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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

		
		const fileName = getPath() + "/" + date + " - " + time  + ".md";
		
		new Notice("Creating " + fileName);
		const frontmatter = await createFrontmatter(date + " " + hours + ":" + minutes + ":" + seconds + " " + timezoneOffset, this);
		new Notice(frontmatter);
		
		try {
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

async function createFrontmatter(datetime: string, plugin: PurplePlugin): Promise<string> {
	
	const stdout = await runCommand(`~/.local/bin/whereami | awk '/Latitude:|Longitude:/ { printf "%0.4f,", $2 }'`);
	const location = stdout.split(",");
	const latitude = location[0];
	const longitude = location[1];

	new Notice("Location: " + latitude + ", " + longitude);
	const googleUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=' + plugin.settings.googleAPIKey;
	const googleResult = await runCommand("curl '" + googleUrl + "'");
	const googleJson = JSON.parse(googleResult);
	const address = googleJson.results[0].formatted_address;
	new Notice("Location: " + address);

	const darkSkyUrl = 'https://api.darksky.net/forecast/' + plugin.settings.darkSkyApiKey + '/' + latitude + ',' + longitude + '?exclude=minutely,hourly,daily,alerts,flags&lang=de&units=si';
	const darkSkyResult = await runCommand("curl '" + darkSkyUrl + "'");
	const darkSkyJson = JSON.parse(darkSkyResult);
    
	return `---
date: ${datetime}
location:
    name: ${address}
    latitude: ${latitude}
    longitude: ${longitude}
weather:
    summary: ${darkSkyJson.currently.summary}
    temperature: ${darkSkyJson.currently.temperature}
    sky: ${darkSkyJson.currently.icon}
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: PurplePlugin;

	constructor(app: App, plugin: PurplePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Google API Key')
			.setDesc('You can get it from Google')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.googleAPIKey)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.googleAPIKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('DarkSky API Key')
			.setDesc('You can get it from DarkSky')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.darkSkyApiKey)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.darkSkyApiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
