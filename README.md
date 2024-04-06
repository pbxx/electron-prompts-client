# electron-prompts-client

The client (renderer) library for [electron-prompts](https://www.npmjs.com/package/electron-prompts?activeTab=readme)

Used for creating customized prompt windows with your own HTML, CSS, and JS. 
## Installation
The library can be downloaded by one of the following methods:
- [JSDelivr CDN](https://cdn.jsdelivr.net/npm/electron-prompts-client/dist/electron-prompts-client.min.js) (~4.7kb minified)
<!-- - JSDelivr CDN [download](https://cdn.jsdelivr.net/package/npm/electron-prompts-client) -->

Include the js file in your prompt's HTML file using a `<script>` tag:
```html
<script src="./electron-prompts-client.js"></script>
```

## Usage
The script uses IPC methods exposed by the [electron-prompts](https://www.npmjs.com/package/electron-prompts?activeTab=readme) module on the Electron main process to coordinate displaying of templated prompts and returning of changed data. 

The script expects 2 `<div>` elements with `id="epc-elembox"` and `id="epc-buttonbox"`, as well as a text element to display the window title, with `id="epc-titletext"`. 

The `#epc-elembox` should display elements in vertical order, such as when `flex-direction: column;` is applied with CSS. 

### Example:
```html
<div class="app">
    <div class="titleBar draggable">
        <span id="epc-titletext"><!-- Window title text will spawn here --></span>
    </div>
    <div id="epc-elembox">
        <!-- Form Element objects will be rendered here -->
    </div>
    <div id="epc-buttonbox">
        <!-- Button Element objects will be rendered here -->
    </div>
</div>
```