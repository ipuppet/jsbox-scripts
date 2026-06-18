#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const readline = require("readline")

const ROOT = __dirname
const TEMPLATE_DIR = path.join(ROOT, "demo2")

const TEXT_EXTENSIONS = new Set([".js", ".json", ".md", ".strings", ".txt"])

const PLACEHOLDER_KEYS = [
    "APP_NAME",
    "APP_VERSION",
    "APP_DESCRIPTION",
    "AUTHOR",
    "WEBSITE",
    "GITHUB_URL",
    "GITHUB_REPO",
    "STORAGE_NAME",
    "UPDATE_CHECK_URL"
]

function printHelp() {
    console.log(`Usage: node create-project.js [options] [name]

Create a new JSBox app from the demo2 template.

Options:
  -n, --name <name>           Application name
  -o, --output <path>         Output directory (default: ../<slug>)
  -v, --version <version>     App version (default: 1.0.0)
  -d, --description <text>    Short description
  -a, --author <name>         Author name
  -w, --website <url>         Author website
  -g, --github <url>          GitHub repository URL
  -s, --storage <name>        Storage directory name (default: slug of app name)
  -u, --update-url <url>      Remote config.json URL for update checks
  -y, --yes                   Skip overwrite confirmation
  -h, --help                  Show this help message

Examples:
  npm run create -- MyApp
  npm run create -- --name "My App" --output ../MyApp --author ipuppet
  node create-project.js MyApp -g https://github.com/user/repo
`)
}

function parseArgs(argv) {
    const args = {
        name: "",
        output: "",
        version: "1.0.0",
        description: "",
        author: "",
        website: "",
        github: "",
        storage: "",
        updateUrl: "",
        yes: false,
        help: false
    }

    const positional = []

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i]

        switch (arg) {
            case "-h":
            case "--help":
                args.help = true
                break
            case "-y":
            case "--yes":
                args.yes = true
                break
            case "-n":
            case "--name":
                args.name = argv[++i] ?? ""
                break
            case "-o":
            case "--output":
                args.output = argv[++i] ?? ""
                break
            case "-v":
            case "--version":
                args.version = argv[++i] ?? args.version
                break
            case "-d":
            case "--description":
                args.description = argv[++i] ?? ""
                break
            case "-a":
            case "--author":
                args.author = argv[++i] ?? ""
                break
            case "-w":
            case "--website":
                args.website = argv[++i] ?? ""
                break
            case "-g":
            case "--github":
                args.github = argv[++i] ?? ""
                break
            case "-s":
            case "--storage":
                args.storage = argv[++i] ?? ""
                break
            case "-u":
            case "--update-url":
                args.updateUrl = argv[++i] ?? ""
                break
            default:
                if (arg.startsWith("-")) {
                    throw new Error(`Unknown option: ${arg}`)
                }
                positional.push(arg)
        }
    }

    if (!args.name && positional[0]) {
        args.name = positional[0]
    }

    return args
}

function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-")
}

function storageNameFromAppName(name) {
    return name
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "")
        .toLowerCase()
}

function githubRepoFromUrl(url) {
    if (!url) return ""

    try {
        const parsed = new URL(url)
        const parts = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/")
        if (parts.length >= 2) {
            return `${parts[0]}/${parts[1]}`
        }
    } catch {}

    const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/i)
    return match ? `${match[1]}/${match[2]}` : ""
}

function updateUrlFromGithub(url) {
    const repo = githubRepoFromUrl(url)
    if (!repo) return ""
    return `https://raw.githubusercontent.com/${repo}/master/config.json`
}

function readGitDefault(field) {
    try {
        const { execSync } = require("child_process")
        return execSync(`git config --get ${field}`, {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"]
        }).trim()
    } catch {
        return ""
    }
}

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
}

function ask(rl, question, defaultValue = "") {
    const suffix = defaultValue ? ` [${defaultValue}]` : ""
    return new Promise(resolve => {
        rl.question(`${question}${suffix}: `, answer => {
            const value = answer.trim()
            resolve(value || defaultValue)
        })
    })
}

async function promptForMissing(args) {
    const rl = createInterface()

    try {
        if (!args.name) {
            args.name = await ask(rl, "Application name")
        }

        const slug = slugify(args.name)
        const defaultOutput = path.resolve(ROOT, "..", slug || "new-app")

        if (!args.output) {
            args.output = await ask(rl, "Output directory", defaultOutput)
        }

        if (!args.description) {
            args.description = await ask(rl, "Description", `A JSBox app built with EasyJsBox.`)
        }

        if (!args.author) {
            args.author = await ask(rl, "Author", readGitDefault("user.name") || "author")
        }

        if (!args.website) {
            args.website = await ask(rl, "Website", "")
        }

        if (!args.github) {
            args.github = await ask(rl, "GitHub URL", "")
        }
    } finally {
        rl.close()
    }

    return args
}

function assertTemplateExists() {
    if (!fs.existsSync(TEMPLATE_DIR)) {
        throw new Error(`Template directory not found: ${TEMPLATE_DIR}`)
    }

    const assetsDir = path.join(TEMPLATE_DIR, "assets")
    const iconPath = path.join(assetsDir, "icon.png")

    if (!fs.existsSync(assetsDir)) {
        throw new Error(`Template assets directory not found: ${assetsDir}`)
    }

    if (!fs.existsSync(iconPath)) {
        throw new Error(`Template app icon not found: ${iconPath}`)
    }
}

function assertProjectAssets(outputPath) {
    const assetsDir = path.join(outputPath, "assets")
    const iconPath = path.join(assetsDir, "icon.png")

    if (!fs.existsSync(assetsDir) || !fs.existsSync(iconPath)) {
        throw new Error(`Project assets are incomplete: ${assetsDir}`)
    }
}

function assertOutputAvailable(outputPath, yes) {
    if (!fs.existsSync(outputPath)) {
        return
    }

    const entries = fs.readdirSync(outputPath)
    if (entries.length === 0) {
        return
    }

    if (yes) {
        return
    }

    throw new Error(`Output directory already exists and is not empty: ${outputPath}\nUse --yes to continue anyway.`)
}

function copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true })

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath)
        } else if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

function shouldProcessFile(filePath) {
    return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function replacePlaceholders(content, replacements) {
    let result = content
    for (const key of PLACEHOLDER_KEYS) {
        result = result.split(`{{${key}}}`).join(replacements[key] ?? "")
    }
    return result
}

function applyReplacements(targetDir, replacements) {
    for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
        const entryPath = path.join(targetDir, entry.name)

        if (entry.isDirectory()) {
            applyReplacements(entryPath, replacements)
            continue
        }

        if (!entry.isFile() || !shouldProcessFile(entryPath)) {
            continue
        }

        const content = fs.readFileSync(entryPath, "utf8")
        const nextContent = replacePlaceholders(content, replacements)
        if (nextContent !== content) {
            fs.writeFileSync(entryPath, nextContent, "utf8")
        }
    }
}

function buildReplacements(args) {
    const storageName = args.storage || storageNameFromAppName(args.name) || slugify(args.name).replace(/-/g, "")
    const githubRepo = githubRepoFromUrl(args.github)
    const updateUrl = args.updateUrl || updateUrlFromGithub(args.github)

    return {
        APP_NAME: args.name,
        APP_VERSION: args.version,
        APP_DESCRIPTION: args.description,
        AUTHOR: args.author,
        WEBSITE: args.website,
        GITHUB_URL: args.github,
        GITHUB_REPO: githubRepo,
        STORAGE_NAME: storageName,
        UPDATE_CHECK_URL: updateUrl
    }
}

function printSummary(outputPath, replacements) {
    console.log("")
    console.log("Project created successfully.")
    console.log("")
    console.log(`  Path:    ${outputPath}`)
    console.log(`  Name:    ${replacements.APP_NAME}`)
    console.log(`  Version: ${replacements.APP_VERSION}`)
    console.log(`  Storage: shared://${replacements.STORAGE_NAME}`)
    if (replacements.GITHUB_URL) {
        console.log(`  GitHub:  ${replacements.GITHUB_URL}`)
    }
    console.log("")
    console.log("Next steps:")
    console.log(`  1. Replace icons in ${path.join(outputPath, "assets")}`)
    console.log(`  2. Open ${outputPath} in JSBox`)
    console.log("  3. Run the project on device or simulator")
    console.log("")
}

async function main() {
    let args

    try {
        args = parseArgs(process.argv.slice(2))
    } catch (error) {
        console.error(error.message)
        printHelp()
        process.exit(1)
    }

    if (args.help) {
        printHelp()
        return
    }

    if (!process.stdin.isTTY) {
        if (!args.name) {
            console.error("Application name is required in non-interactive mode.")
            printHelp()
            process.exit(1)
        }
    } else if (!args.name || !args.output) {
        args = await promptForMissing(args)
    }

    if (!args.name?.trim()) {
        console.error("Application name is required.")
        process.exit(1)
    }

    args.name = args.name.trim()

    const slug = slugify(args.name) || "new-app"
    const outputPath = path.resolve(args.output || path.join(ROOT, "..", slug))

    assertTemplateExists()
    assertOutputAvailable(outputPath, args.yes)

    const replacements = buildReplacements(args)

    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    copyDirectory(TEMPLATE_DIR, outputPath)
    applyReplacements(outputPath, replacements)
    assertProjectAssets(outputPath)

    printSummary(outputPath, replacements)
}

main().catch(error => {
    console.error(error.message)
    process.exit(1)
})
