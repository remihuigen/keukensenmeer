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
import { existsSync } from 'node:fs'
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
 * @description Sets up chokidar watcher targeting TypeScript files in the projects directory
 */
function startWatcher() {
	if (!existsSync(projectsDir)) {
		log('❌ Projects directory does not exist!', 'error')
		process.exit(1)
	}

	log('👀 Starting file watcher...')

	const watcher = watch(projectsDir, {
		ignored: /index\.ts$/,
		ignoreInitial: true,
		persistent: true,
		usePolling: false,
		depth: 0,
		awaitWriteFinish: {
			stabilityThreshold: 200,
			pollInterval: 100,
		},
	})

	watcher
		.on('ready', () => log('🟢 Watcher ready and monitoring'))
		.on('add', (path) => handleFileChange('add', path))
		.on('change', (path) => handleFileChange('change', path))
		.on('unlink', (path) => handleFileChange('unlink', path))
		.on('error', (error) => {
			log(`❌ Watcher error`, 'error')
			console.error(error)
		})

	process.on('SIGINT', () => {
		log('🛑 Shutting down watcher...')
		watcher.close().then(() => {
			log('✅ Watcher stopped')
			process.exit(0)
		})
	})
}

startWatcher()
