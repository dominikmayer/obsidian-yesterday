<img alt="Yesterday logo" src="yesterday-logo.svg" width="125" height="125">

## Yesterday

This plugin lets you create and edit a [Yesterday](https://www.yesterday.md) journal in [Obsidian](https://obsidian.md).

### Yesterday Syntax

Yesterday extends [Markdown](https://www.markdownguide.org/basic-syntax/) with support for journal entries including support for

- dialogs (or WhatsApp, Messenger, iMessage, … chats)
- dreams
- media [content blocks](https://ia.net/writer/support/library/content-blocks)

Learn more [here.](https://mitado.notion.site/How-to-write-d3d76812fdef4bf3aa48d727d53c6e0d)

#### Example

```
---
date: 2010-02-02 17:05:32 -04:00
location:
    name: Times Square, New York, USA
    latitude: 40.7580
    longitude: -73.9855
weather:
    summary: Icy
    temperature: 3.06
    sky: partly-cloudy-day
---

§§§
I found myself in an ancient library, its shelves stretching into infinity under a dim, mysterious light. Among the endless rows, a book with a cover that shimmered like stardust caught my eye. Just as my fingers grazed its spine, it fluttered away, leading me through a labyrinth of shelves. This chase brought me to a serene clearing where the duck from earlier awaited, its feathers aglow with an ethereal light. It spoke with a voice that resonated with both familiarity and otherworldliness, imparting wisdom that felt profound yet slipped away upon waking.
§§§

Today's adventure took us to the heart of the city, yet away from its clamor: Central Park. A green oasis amidst the concrete jungle, each path and bench tells a story. Our first stop was the Bethesda Terrace, its intricate stonework and arches a testament to craftsmanship and vision.

/2010-02-02 - 15-12-13.jpg
/2010-02-02 - 15-12-45.jpg

Not far from there, the Bow Bridge presented a picturesque scene, its graceful curve reflecting on the calm lake waters, a perfect moment captured in the soft afternoon light.

/2010-02-02 - 16-01-31.jpg

While walking home, Karen shared a joke that unexpectedly lightened the mood:

.Doctor: I'm sorry but you suffer from a terminal illness and have only 10 to live.
.Patient (anxiously): What do you mean, 10?
.Patient: 10 what?
.Patient: Months?
.Patient: Weeks?!
.Doctor: Nine.
.Patient: 😳
```

![Example rendering](https://ik.imagekit.io/mitado/obsidian-yesterday-example_yuoXeej6j.png)

Click on any image to show a larger version.

### Journal Vault

If you have your journal in its own vault you can

- clean up the sidebar to show only notes and hide all media and
- color code open and closed entries.

Before             |  After
:-------------------------:|:-------------------------:
![File explorer without plugin](https://ik.imagekit.io/mitado/obsidian-yesterday-explorer-before_OO7k4XSds.png?updatedAt=1708838224342)|![File explorer with plugin](https://ik.imagekit.io/mitado/obsidian-yesterday-explorer-after_fTS5VBiQG.png?updatedAt=1708838224168)

Icons and commands (that can be activated by [hotkeys](https://help.obsidian.md/User+interface/Hotkeys)) let you

- create new entries at the right location and
- toggle entries between open and closed.

You can show the number of open entries in the status bar.

### Installation

You can install the plugin from within Obsidian by searching for `Yesterday` in the Community Plugins section or by clicking [here](https://obsidian.md/plugins?id=yesterday).

### Read On

For further information check out [Yesterday](https://www.yesterday.md).


### Other Plugins

- [Reader Mode](https://github.com/dominikmayer/obsidian-reader-mode) ensures that notes are opened in reader mode, so you can see dialogs rendered right away.
- [Note ID](https://github.com/dominikmayer/obsidian-note-id) Organizes notes by an ID property, providing a structured way to create and maintain a note sequence, inspired by [Zettelkasten](https://zettelkasten.de/introduction/) principles ("Folgezettel").