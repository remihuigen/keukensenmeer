/**
 * File watcher for project data files
 *
 * @description Watches the data/projects directory for changes and automatically
 * regenerates the project index when TypeScript files are added, modified, or deleted.
 * Excludes changes to the index.ts file itself to prevent infinite loops.
 *
 * @module watchProjects
 */

import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { watch } from 'chokidar'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectsDir = resolve(__dirname, '../data/projects')

let isGenerating = false

/**
 * Enhanced logging with DATA prefix for better visibility in concurrently
 *
 * @param {string} message - Message to log
 * @param {'info' | 'warn' | 'error'} level - Log level
 */
function log(message, level = 'info') {
	const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
	const prefix = `[DATA ${timestamp}]`

	switch (level) {
		case 'error':
			 
			console.error(prefix, message)
			break
		case 'warn':
			 
			console.warn(prefix, message)
			break
		default:
			// eslint-disable-next-line security-node/detect-crlf
			console.log(prefix, message)
	}
}

/**
 * Validates watcher setup and returns files to watch
 *
 * @description Checks directory structure and identifies TypeScript files to monitor
 * @returns {string[]} Array of full file paths that should be watched
 */
function getWatchableFiles() {
	if (!existsSync(projectsDir)) {
		log('❌ Projects directory does not exist!', 'error')
		return []
	}

	try {
		const files = readdirSync(projectsDir)
		const watchableFiles = []

		files.forEach((file) => {
			const fullPath = resolve(projectsDir, file)
			const isTypeScript = file.endsWith('.ts')
			const isIndex = file === 'index.ts'

			if (isTypeScript && !isIndex) {
				watchableFiles.push(fullPath)
			}
		})

		log(`🔍 Found ${watchableFiles.length} project files to watch`)
		return watchableFiles
	} catch (error) {
		log(`❌ Error reading directory: ${error.message}`, 'error')
		return []
	}
}

/**
 * Regenerates the project index by running the generation script
 *
 * @description Spawns the generateProjectIndex.js script and handles output
 * @returns {Promise<void>} Resolves when generation completes
 */
function regenerateProjects() {
	return new Promise((resolve, reject) => {
		if (isGenerating) {
			log('⏳ Generation in progress, skipping...', 'warn')
			resolve()
			return
		}

		isGenerating = true
		log('🔄 Regenerating project index...')

		const child = spawn('node', ['scripts/generateProjectIndex.js'], {
			stdio: 'pipe',
			cwd: resolve(__dirname, '..'),
		})

		let errorOutput = ''

		child.stderr?.on('data', (data) => {
			errorOutput += data.toString()
		})

		child.on('close', (code) => {
			isGenerating = false

			if (code === 0) {
				log('✅ Projects regenerated successfully')
				resolve()
			} else {
				log(`❌ Generation failed with exit code: ${code}`, 'error')
				if (errorOutput.trim()) {
					log(`Error: ${errorOutput.trim()}`, 'error')
				}
				reject(new Error(`Generation failed with exit code ${code}`))
			}
		})

		child.on('error', (error) => {
			isGenerating = false
			log(`❌ Failed to spawn generation process: ${error.message}`, 'error')
			reject(error)
		})
	})
}

/**
 * Handles file change events with proper error handling
 *
 * @description Wrapper function to handle regeneration with error logging
 * @param {'add' | 'change' | 'unlink'} eventType - Type of file event
 * @param {string} path - Path to the changed file
 */
function handleFileChange(eventType, path) {
	const eventEmojis = {
		add: '➕',
		change: '📝',
		unlink: '🗑️',
	}

	// eslint-disable-next-line security/detect-object-injection
	const emoji = eventEmojis[eventType] || '📄'
	log(`${emoji} File ${eventType}: ${path}`)

	regenerateProjects().catch((error) => {
		log(`❌ Regeneration failed: ${error.message}`, 'error')
	})
}

/**
 * Starts the file watcher with event logging
 *
 * @description Sets up chokidar watcher targeting specific TypeScript files
 */
function startWatcher() {
	const watchableFiles = getWatchableFiles()

	if (watchableFiles.length === 0) {
		log('❌ No files to watch - exiting', 'error')
		process.exit(1)
	}

	log('👀 Starting file watcher...')

	const watcher = watch(watchableFiles, {
		ignoreInitial: true,
		persistent: true,
		usePolling: false,
		awaitWriteFinish: {
			stabilityThreshold: 200,
			pollInterval: 100,
		},
	})

	watcher
		.on('ready', () => {
			log('🟢 Watcher ready and monitoring')

			// Check if watcher is actually watching directories
			const watched = watcher.getWatched()
			if (Object.keys(watched).length === 0) {
				log('⚠️ No directories detected, switching to polling mode...', 'warn')
				watcher.close()
				setTimeout(() => startPollingWatcher(watchableFiles), 500)
			}
		})
		.on('add', (path) => handleFileChange('add', path))
		.on('change', (path) => handleFileChange('change', path))
		.on('unlink', (path) => handleFileChange('unlink', path))
		.on('error', (error) => {
			log(`❌ Watcher error: ${error.message}`, 'error')
			log('🔄 Switching to polling mode...', 'warn')

			try {
				watcher.close()
				setTimeout(() => startPollingWatcher(watchableFiles), 1000)
			} catch (closeError) {
				 
				log(`❌ Error closing watcher: ${closeError.message}`, 'error')
			}
		})

	// Graceful shutdown
	process.on('SIGINT', () => {
		log('🛑 Shutting down watcher...')

		watcher
			.close()
			.then(() => {
				log('✅ Watcher stopped')
				process.exit(0)
			})
			.catch((error) => {
				 
				log(`❌ Error during shutdown: ${error.message}`, 'error')
				process.exit(1)
			})
	})
}

/**
 * Fallback watcher using polling mode for systems with unreliable native events
 *
 * @description Creates a polling-based watcher as fallback when native events fail
 * @param {string[]} filesToWatch - Array of full file paths to watch
 */
function startPollingWatcher(filesToWatch) {
	log('🔄 Starting polling watcher...')

	const watcher = watch(filesToWatch, {
		ignoreInitial: true,
		persistent: true,
		usePolling: true,
		interval: 1000,
		awaitWriteFinish: {
			stabilityThreshold: 300,
			pollInterval: 100,
		},
	})

	watcher
		.on('ready', () => {
			log('🟢 Polling watcher ready')
		})
		.on('change', (path) => handleFileChange('change', path))
		.on('add', (path) => handleFileChange('add', path))
		.on('unlink', (path) => handleFileChange('unlink', path))
		.on('error', (error) => {
			log(`❌ Polling watcher error: ${error.message}`, 'error')
		})

	process.on('SIGINT', () => {
		log('🛑 Shutting down polling watcher...')

		watcher
			.close()
			.then(() => {
				log('✅ Polling watcher stopped')
				process.exit(0)
			})
			.catch((error) => {
				 
				log(`❌ Error during polling watcher shutdown: ${error.message}`, 'error')
				process.exit(1)
			})
	})
}

startWatcher()
