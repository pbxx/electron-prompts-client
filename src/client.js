

const lTables = {
	inputHTMLType: {
		onChange: [
			"number",
			"radio",
			"checkbox",
			"range",
			"file",
			"date",
			"datetime-local",
			"time",
			"week",
			"month",
			"color",
		],
		restrictedAttributes: [
			"id",
			"onchange",
			"onkeyup"
		]
	}
}
export default class ElectronPromptsClient {
	adoptedPrompt = null
	devMode = false
    formStateDefaults = {}
    formState = {}
    constructor() {

    }
    init = async () => {
        const elems = {
            ebox: document.querySelector(".epc-elembox") || document.getElementById("epc-elembox"),
            bbox: document.querySelector(".epc-buttonbox") || document.getElementById("epc-buttonbox"),
            titleText: document.querySelector(".epc-titletext") || document.getElementById("epc-titletext")
        }
        this.adoptedPrompt = await window.electronAPI.adopt()
        if (this.adoptedPrompt) {
            if (this.adoptedPrompt.devMode) {
                // set this.devMode to true
                this.devMode = true
            }
            this.logs.log(this.adoptedPrompt, this.adoptedPrompt.windowTitle)
            // set title bar text
            elems.titleText.innerHTML = this.adoptedPrompt.windowTitle
            // set window title
            document.title = this.adoptedPrompt.windowTitle
            this.adoptedPrompt.elements.forEach((elem) => {
                // append each form element
                switch (elem.type) {
                    case "header": {
                        var domElem = elems.ebox.appendChild(document.createElement("h4"))
                        domElem.innerHTML = elem.value
                        if (elem.classes) {
                            elem.classes.forEach((cssClass) => {
                                domElem.classList.add(cssClass)
                            })
                        }
                        break
                    }
                    case "paragraph": {
                        var domElem = elems.ebox.appendChild(document.createElement("p"))
                        domElem.innerHTML = elem.value
                        if (elem.classes) {
                            elem.classes.forEach((cssClass) => {
                                domElem.classList.add(cssClass)
                            })
                        }
                        break
                    }
                    case "input": {
                        var domElem = elems.ebox.appendChild(document.createElement("input"))
                        var updateEvent = "keyup"
                        this.formStateDefaults[elem.name] = elem.value === undefined ? "" : elem.value
                        console.log(elem)
                        if ("attributes" in elem) {
                            // assign custom attributes if specified
                            if ("type" in elem.attributes && lTables.inputHTMLType.onChange.includes(elem.attributes.type)) {
                                // changes should be detected with onchange
                                updateEvent = "change"
                                
                            }

                            Object.keys(elem.attributes).forEach((attrKey) => {
                                if (!lTables.inputHTMLType.restrictedAttributes.includes(attrKey)) {
                                    // not a restricted attribute
                                    if (elem.attributes[attrKey] === true) {
                                        // this is a boolean attribute
                                        domElem.setAttribute(attrKey, '')
                                    } else {
                                        domElem.setAttribute(attrKey, elem.attributes[attrKey])
                                    }
                                    
                                }
                            })
                        }
                        if ("classes" in elem) {
                            // assign custom classes if specified
                            elem.classes.forEach((cssClass) => {
                                domElem.classList.add(cssClass)
                            })
                        }
                        if ("placeholder" in elem) {
                            // shortcut for placeholder attribute
                            domElem.setAttribute("placeholder", elem.placeholder)
                        }
                        // set optional "value" attribute
                        if ("value" in elem) {
                            domElem.value = elem.value
                        }
                        
                        // add <id> for data fetching
                        domElem.setAttribute("id", `form-${elem.name}`)
                        // setup update tracking
                        if ("attributes" in elem && "type" in elem.attributes && elem.attributes.type == "file") {
							domElem.addEventListener(elem.updateEvent || updateEvent, this.updateFormStateFile(elem.name))
                        } else {
							domElem.addEventListener(elem.updateEvent || updateEvent, this.updateFormState(elem.name))
                        }
                        
                        break
                    }
                    case "select": {
                        var domElem = elems.ebox.appendChild(document.createElement("select"))
                        if (elem.classes) {
                            elem.classes.forEach((cssClass) => {
                                domElem.classList.add(cssClass)
                            })
                        }
                        console.log(elem)
                        if (elem.options && Array.isArray(elem.options)) {
                            // these are the options of the select
                            var defaultOptionIndex = this.utils.select.findDefault(elem.options)
                            this.formStateDefaults[elem.name] = elem.options[defaultOptionIndex].value
                            var i = 0
                            elem.options.forEach((opt) => {
                                if (opt.value) {
                                    // value is required for a select
                                    var optElem = domElem.appendChild(document.createElement("option"))
                                    optElem.setAttribute("value", opt.value)
                                    optElem.innerHTML = (opt.text || opt.value)
                                    console.log(i, defaultOptionIndex)
                                    if (i == defaultOptionIndex) {
                                        // this is the default option
                                        optElem.selected = true
                                    }
                                }
                                i++
                            })
                        }
    
                        // domElem.setAttribute("placeholder", elem.placeholder ? elem.placeholder : `Original value: ${elem.value}`)
                        // domElem.value = elem.value
                        domElem.setAttribute("id", `form-${elem.name}`)
                        // event tracking
						domElem.addEventListener("change", this.updateFormState(elem.name))
                        break
                    }
                }
            })
    
            // size window up based on element content height
            await window.electronAPI.sizeUp(this.adoptedPrompt.uuid, elems.ebox.scrollHeight)
            console.log(this.formStateDefaults)
    
            //   append cancel button
            var cancelButton = elems.bbox.appendChild(document.createElement("button"))
			cancelButton.addEventListener("click", this.handleCancelButton(this.adoptedPrompt.uuid))
            if (this.adoptedPrompt.cancelButton) {
                if (this.adoptedPrompt.cancelButton.classes) {
                    this.adoptedPrompt.cancelButton.classes.forEach((cssClass) => {
                        cancelButton.classList.add(cssClass)
                    })
                }
                cancelButton.innerHTML = this.adoptedPrompt.cancelButton.value ? this.adoptedPrompt.cancelButton.value : "Cancel"
            } else {
                cancelButton.innerHTML = "Cancel"
            }
    
            // add enter key listener
            window.addEventListener("keypress", async (event) => {
                if (event.key === "Enter") {
                    event.preventDefault()
                    await this.handleButtonClick(this.adoptedPrompt.uuid, "_enter")()
                }
            })
            
    
            // append each action button
            var i = 0
            this.adoptedPrompt.buttons.forEach((elem) => {
                var domElem = elems.bbox.appendChild(document.createElement("button"))
				domElem.addEventListener("click", this.handleButtonClick(this.adoptedPrompt.uuid, elem.name))
                if (elem.classes) {
                    elem.classes.forEach((cssClass) => {
                        domElem.classList.add(cssClass)
                    })
                }
                domElem.innerHTML = elem.value
                i++
            })
            
    
        } else {
            this.logs.log("No prompt to adopt! Need to close...")
        }
    }
    utils = {
        select: {
            findDefault: (arr) => {
                // finds the default value and index of the passed array of Option Elements
                var defaultIndex = 0
                var i = 0
                arr.forEach((optObj) => {
                    // console.log(optObj)
                    if ("selected" in optObj) {
                        // console.log("found a default select option at index " + i)
                        // this option was specified as default
                        defaultIndex = i
                    }
                    i++
                })
                return defaultIndex
            }
        }
    }
	logs = {
		log: (...args) => {
			if (this.devMode) {
				console.log(...args)
			}
		},
		error: (...args) => {
			if (this.devMode) {
				console.error(...args)
			}
		},
	}
    handleButtonClick = (id, index) => {
        return async (event) => {
			this.logs.log(id, index)
			// await window.electronAPI.formDone(id, {foo: "bar"} )
			var promptResult = {
				button: index
			}
			if (Object.keys(this.formState).length > 0) {
				promptResult["values"] = this.formState
			}
			await window.electronAPI.formDone(id, promptResult)
			window.close()
		}
    }
    handleCancel = async () => {
        await window.electronAPI.cancel(this.adoptedPrompt.uuid)
        this.logs.log("cancel time!")
    }
    handleCancelButton = () => {
        return async () => {
			await this.handleCancel()
			window.close()
		}
    }
    updateFormState = (stateIndex) => {
        return (event) => {
			const formValue = document.getElementById(`form-${stateIndex}`).value
			this.logs.log(stateIndex, formValue)
			if (formValue == this.formStateDefaults[stateIndex]) {
				// value is same as default
				if (stateIndex in this.formState) {
					delete this.formState[stateIndex]
				}
			} else {
				this.formState[stateIndex] = formValue
			}
			this.logs.log(this.formState)
		}
    }
    updateFormStateFile = (stateIndex) => {
        return (event) => {
			var formFiles = []
			var docFiles = document.getElementById(`form-${stateIndex}`).files
			console.log(docFiles)
			console.log(docFiles.length)
			for (var i = 0; i < docFiles.length; i++) {
				console.log("found a file")
				formFiles.push({
					name: docFiles[i].name,
					path: docFiles[i].path,
					size: docFiles[i].size,
					lastModified: docFiles[i].lastModified,
				})
			}
			this.logs.log(stateIndex, formFiles)
			if (formFiles.length == 0) {
				// value is same as default
				if (stateIndex in this.formState) {
					delete this.formState[stateIndex]
				}
			} else {
				this.formState[stateIndex] = formFiles
			}
			this.logs.log(this.formState)
		}
    }
}
