# electron-prompts-client

The client (renderer) library for [electron-prompts](https://www.npmjs.com/package/electron-prompts?activeTab=readme)

Used for creating customized prompt windows with your own HTML, CSS, and JS. You do not need this library if you are using the default prompts.
## Installation
The library can be downloaded by one of the following methods:
- [JSDelivr CDN](https://cdn.jsdelivr.net/npm/electron-prompts-client/dist/electron-prompts-client.min.js) (~4.7kb minified)
<!-- - JSDelivr CDN [download](https://cdn.jsdelivr.net/package/npm/electron-prompts-client) -->

Include the js file in your prompt's HTML file using a `<script>` tag:
```html
<script src="./electron-prompts-client.js"></script>
```

## Usage
The script uses IPC methods defined in the preload file by the [electron-prompts](https://www.npmjs.com/package/electron-prompts?activeTab=readme) module on the Electron main process to coordinate creating customized prompt windows using [Prompt Templates](https://pbxx.github.io/electron-prompts/docs/api/data-structures/promptTemplate), as well as the returning of changed data on completion. 

The script will need some specific elements in the `prompt.html` in order to work properly:
-  `<div>` with class `epc-elembox`
    - This is the div responsible for holding [Form Elements](https://pbxx.github.io/electron-prompts/docs/api/data-structures/form-element-objects)
    - It should display elements in vertical order, such as when `flex-direction: column;` is applied with CSS.
    - It should have `overflow-y` set to `auto`, ideally. (This will help when tweaking the [`baseHeight`](../api/prompt-manager/index.md) option)
- `<div>` with class `epc-buttonbox`
    - This is the div that will hold the [Button Elements](https://pbxx.github.io/electron-prompts/docs/api/data-structures/button-element-objects) that are rendered in the prompt.
    - By default, this is displayed at the bottom of the prompt window.
- Text element with class `epc-titletext`
    - Such as a `<span>`, `<p>`, or `<h5>`
    - Displays the `windowTitle` option assigned in the prompt's [Prompt Template](https://pbxx.github.io/electron-prompts/docs/api/data-structures/promptTemplate).
- Visible area with class `-webkit-app-region: drag;`
    - Electron requirement when using frameless windows
    - If there is no visible `drag` region, the window will not be draggable by the user

### Example:
```html
<div class="app">
    <div class="titleBar draggable">
        <span class="epc-titletext"><!-- Window title text will spawn here --></span>
    </div>
    <div class="epc-elembox">
        <!-- Form Element objects will be rendered here -->
    </div>
    <div class="epc-buttonbox">
        <!-- Button Element objects will be rendered here -->
    </div>
</div>
```