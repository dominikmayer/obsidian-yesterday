<div>
    <img src="https://images.unsplash.com/photo-1635701651842-8b43c35b81fc?ixlib=rb-4.0.3&amp;q=85&amp;fm=jpg&amp;crop=entropy&amp;cs=srgb&amp;w=3600" referrerpolicy="same-origin" style="display: block; object-fit: cover; border-radius: 0px; width: 100%; height: 30vh; opacity: 1; object-position: center 50%;">
    <div style="user-select: none; --pseudoSelection--background: transparent; pointer-events: none;">
        <div style="display: flex; align-items: center; justify-content: center; height: 140px; width: 140px; border-radius: 0.25em; flex-shrink: 0; position: relative; z-index: 1; margin-left: 3px; margin-bottom: 0px; margin-top: -80px; pointer-events: auto;">
            <div>
                <div style="width: 100%; height: 100%;">
                    <img alt="Page icon" src="yesterday-logo.svg" referrerpolicy="same-origin" style="display: block; object-fit: cover; border-radius: 4px; width: 124.32px; height: 124.32px; transition: opacity 100ms ease-out 0s;">
                </div>
            </div>
        </div>
        <div style="display: flex; justify-content: flex-start; flex-wrap: wrap; margin-top: 8px; margin-bottom: 4px; margin-left: -1px; color: rgba(255, 255, 255, 0.282); pointer-events: auto;"></div>
    </div>
</div>

## Yesterday

This plugin lets you create and edit a [Yesterday](https://www.yesterday.md) journal in [Obsidian](https://obsidian.md).

### Yesterday Syntax

Yesterday extends [Markdown](https://www.markdownguide.org/basic-syntax/) with support for journal entries including support for

- dialogs (or WhatsApp, Messenger, iMessage, … chats)
- dreams
- media [content blocks](https://ia.net/writer/support/library/content-blocks)

#### Edit Mode

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

#### View Mode

![Example rendering](https://ik.imagekit.io/mitado/obsidian-yesterday-example_yuoXeej6j.png?updatedAt=1708879259580)

Clicking on any image shows a larger version.

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

While the plugin is not yet available in the community plugins list, you can install it

- using [BRAT](https://github.com/TfTHacker/obsidian42-brat) or
- manually by downloading the latest release from the [GitHub repository](https://github.com/dominikmayer/obsidian-yesterday) and putting it in your plugins folder.

### Read On

For further information check out [Yesterday](https://www.yesterday.md).