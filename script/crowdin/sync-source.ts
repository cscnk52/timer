import { SourceFilesModel, SourceStringsModel } from "@crowdin/crowdin-api-client"
import { groupBy } from "@util/array"
import { CrowdinClient, getClientFromEnv } from "./client"
import { ALL_DIRS, isIgnored, readAllMessages, SOURCE_LOCALE, transMsg } from "./common"

async function initBranch(client: CrowdinClient): Promise<SourceFilesModel.Branch> {
    const branch = await client.getOrCreateMainBranch()
    if (!branch) {
        console.error("Failed to create main branch")
        process.exit(1)
    }
    return branch
}

/**
 * Process strings
 * 
 * @param client client
 * @param existFile exist crowdin file
 * @param fileContent strings
 */
async function processStrings(
    client: CrowdinClient,
    existFile: SourceFilesModel.File,
    fileContent: ItemSet,
) {
    const existStrings = await client.listStringsByFile(existFile.id)
    const existStringsKeyMap = groupBy(existStrings, s => s.identifier, l => l[0])
    const strings2Delete: SourceStringsModel.String[] = []
    const strings2Create: ItemSet = {}
    const strings2Update: ItemSet = {}
    Object.entries(fileContent).forEach(([path, text]) => {
        if (!text) {
            // maybe blank or undefined sometimes
            return
        }
        const existString = existStringsKeyMap[path]
        if (existString) {
            strings2Update[path] = text
        } else {
            strings2Create[path] = text
        }
    })
    Object.entries(existStringsKeyMap).forEach(([path, string]) => !fileContent[path] && strings2Delete.push(string))
    await client.batchCreateString(existFile.id, strings2Create)
    await client.batchUpdateIfNecessary(strings2Update, existStringsKeyMap)
    await client.batchDeleteString(strings2Delete.map(s => s.id))
}


async function processByDir(client: CrowdinClient, dir: Dir, branch: SourceFilesModel.Branch): Promise<void> {
    // 1. init directory
    const dirKey: NameKey = { name: dir, branchId: branch.id }
    let directory = await client.getDirByName(dirKey)
    if (!directory) {
        directory = await client.createDirectory(dirKey)
    }
    console.log('Direcotory: ' + JSON.stringify(directory))
    // 2. iterate all messages
    const messages = await readAllMessages(dir)
    // 3. list all files in directory
    const existFiles = await client.listFilesByDirectory(directory.id)
    console.log("Exists file count: " + existFiles.length)
    const existFileNameMap = groupBy(existFiles, f => f.name, l => l[0])
    // 4. create new files
    for (const [tsFilename, msg] of Object.entries(messages)) {
        if (isIgnored(dir, tsFilename)) {
            console.log(`Ignored file: ${dir}/${tsFilename}`)
            continue
        }
        const crwodinFilename = tsFilename.replace('.ts', '.json')
        const fileContent = transMsg(msg[SOURCE_LOCALE])
        let existFile = existFileNameMap[crwodinFilename]
        if (!existFile) {
            // Create with empty file
            const storage = await client.createStorage(crwodinFilename, fileContent)
            existFile = await client.createFile(directory.id, storage, crwodinFilename)
            console.log(`Created new file: dir=${dir}, fileName=${crwodinFilename}, id=${existFile.id}`)
        }
        // Process by strings
        await processStrings(client, existFile, fileContent)
    }
}

async function main() {
    const client = getClientFromEnv()
    // Init main branch
    const branch = await initBranch(client)
    // Process by dir
    for (const dir of ALL_DIRS) {
        await processByDir(client, dir, branch)
    }
}

main()