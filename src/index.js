import ElectronPromptClient from "./client.js"

const prompts = new ElectronPromptClient()

window.addEventListener('load', async () => {
    await prompts.init()
})