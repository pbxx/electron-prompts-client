var adoptedPrompt = null
var devMode = false

const logs = {
	log(...args) {
		if (devMode) {
			console.log(...args)
		}
	},
	error(...args) {
		if (devMode) {
			console.error(...args)
		}
	},
}

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

async function handleButtonClick(id, index) {
	logs.log(id, index)
	// await window.electronAPI.formDone(id, {foo: "bar"} )
	var promptResult = {
		button: index
	}
	if (Object.keys(formState).length > 0) {
		promptResult["values"] = formState
	}
	await window.electronAPI.formDone(id, promptResult)
	window.close()
}

async function handleCancel() {
	await window.electronAPI.cancel(adoptedPrompt.uuid)
	logs.log("cancel time!")
}

async function handleCancelButton() {
	await handleCancel()
	window.close()
}

var formStateDefaults = {}
var formState = {}

function updateFormState(stateIndex) {
	const formValue = document.getElementById(`form-${stateIndex}`).value
	logs.log(stateIndex, formValue)
	if (formValue == formStateDefaults[stateIndex]) {
		// value is same as default
		if (stateIndex in formState) {
			delete formState[stateIndex]
		}
	} else {
		formState[stateIndex] = formValue
	}
	logs.log(formState)
}

function updateFormStateFile(stateIndex) {
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
	logs.log(stateIndex, formFiles)
	if (formFiles.length == 0) {
		// value is same as default
		if (stateIndex in formState) {
			delete formState[stateIndex]
		}
	} else {
		formState[stateIndex] = formFiles
	}
	logs.log(formState)
}

const utils = {
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

async function init() {
	const elems = {
		ebox: document.getElementById("elemBox"),
		bbox: document.getElementById("buttonBox"),
		titleText: document.querySelector(".titleBar span"),
	}
	adoptedPrompt = await window.electronAPI.adopt()
	if (adoptedPrompt) {
		if (adoptedPrompt.devMode) {
			// set devMode to true
			devMode = true
		}
		logs.log(adoptedPrompt, adoptedPrompt.windowTitle)
		// set title bar text
		elems.titleText.innerHTML = adoptedPrompt.windowTitle
		// set window title
		document.title = adoptedPrompt.windowTitle
		adoptedPrompt.elements.forEach((elem) => {
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
					var updateAttr = "onkeyup"
					formStateDefaults[elem.name] = elem.value === undefined ? "" : elem.value
					console.log(elem)
					if ("attributes" in elem) {
						// assign custom attributes if specified
						if ("type" in elem.attributes && lTables.inputHTMLType.onChange.includes(elem.attributes.type)) {
							// changes should be detected with onchange
							updateAttr = "onchange"
							
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
					if (elem.attributes.type == "file") {
						domElem.setAttribute(elem.updateAttr || updateAttr, `updateFormStateFile("${elem.name}")`)
					} else {
						domElem.setAttribute(elem.updateAttr || updateAttr, `updateFormState("${elem.name}")`)
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
						var defaultOptionIndex = utils.select.findDefault(elem.options)
						formStateDefaults[elem.name] = elem.options[defaultOptionIndex].value
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
					domElem.setAttribute("onchange", `updateFormState("${elem.name}")`)
					break
				}
			}
		})

		// size window up based on element content height
		await window.electronAPI.sizeUp(adoptedPrompt.uuid, elems.ebox.scrollHeight)
		console.log(formStateDefaults)

		//   append cancel button
		var cancelButton = elems.bbox.appendChild(document.createElement("button"))
		cancelButton.setAttribute("onclick", `handleCancelButton("${adoptedPrompt.uuid}")`)
		if (adoptedPrompt.cancelButton) {
			if (adoptedPrompt.cancelButton.classes) {
				adoptedPrompt.cancelButton.classes.forEach((cssClass) => {
					cancelButton.classList.add(cssClass)
				})
			}
			cancelButton.innerHTML = adoptedPrompt.cancelButton.value ? adoptedPrompt.cancelButton.value : "Cancel"
		} else {
			cancelButton.innerHTML = "Cancel"
		}

		// add enter key listener
		window.addEventListener("keypress", async (event) => {
			if (event.key === "Enter") {
				event.preventDefault()
				await handleButtonClick(adoptedPrompt.uuid, "_enter")
			}
		})
		

		// append each action button
		var i = 0
		adoptedPrompt.buttons.forEach((elem) => {
			var domElem = elems.bbox.appendChild(document.createElement("button"))
			domElem.setAttribute("onclick", `handleButtonClick("${adoptedPrompt.uuid}", "${elem.name}")`)
			if (elem.classes) {
				elem.classes.forEach((cssClass) => {
					domElem.classList.add(cssClass)
				})
			}
			domElem.innerHTML = elem.value
			i++
		})
		

	} else {
		logs.log("No prompt to adopt! Need to close...")
	}
}
init()
