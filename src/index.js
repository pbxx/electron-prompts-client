import ElectronPromptsClient from "./client.js"

const prompts = new ElectronPromptsClient()

window.addEventListener('load', async () => {
    await prompts.init()
})