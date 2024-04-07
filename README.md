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

The script expects 2 `<div>` elements to contain the elements and buttons for the prompt, as well as a text element to display the window title. 

The `epc-elembox` class assigns the `<div>` responsible for holding [Form Elements](https://pbxx.github.io/electron-prompts/docs/api/data-structures/form-element-objects), and should display elements in vertical order, such as when `flex-direction: column;` is applied with CSS. It should also expand vertically. *(Expanding is what makes the sizeUp functionality work corectly. )*

The `epc-buttonbox` class `<div>` holds the [Button Elements](https://pbxx.github.io/electron-prompts/docs/api/data-structures/button-element-objects) that are rendered in the prompt. By default, this is displayed at the bottom of the prompt window.

The `epc-titletext` class should be assigned to a text element, such as a `<span>` or `<h5>`, and will display the `windowTitle` option assigned in the prompt's [Prompt Template](https://pbxx.github.io/electron-prompts/docs/api/data-structures/promptTemplate).

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