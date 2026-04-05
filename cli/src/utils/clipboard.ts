/**
 * Clipboard utilities using OSC 52 escape sequences
 * Works in most modern terminal emulators (xterm, tmux, screen, etc.)
 */

/**
 * Copy text to clipboard using OSC 52 escape sequence
 * @param text - The text to copy to clipboard
 * @returns true if successful, false otherwise
 */
export function copyToClipboard(text: string): boolean {
	if (!process.stdout.isTTY) {
		return false
	}

	try {
		// Encode text to base64
		const base64 = Buffer.from(text).toString("base64")

		// OSC 52 format: ESC ] 52 ; c ; <base64-data> BEL
		// 'c' is the clipboard selection: 'c' for clipboard, 'p' for primary
		const osc52 = `\x1b]52;c;${base64}\x07`

		// Write to stdout
		process.stdout.write(osc52)
		return true
	} catch {
		return false
	}
}

/**
 * Check if OSC 52 clipboard is likely supported
 * Returns true if we're in a TTY with a known terminal emulator
 */
export function isClipboardSupported(): boolean {
	if (!process.stdout.isTTY) {
		return false
	}

	const term = process.env.TERM || ""
	const termProgram = process.env.TERM_PROGRAM || ""

	// Known terminals that support OSC 52
	const supportedTerminals = [
		"xterm",
		"xterm-256color",
		"screen",
		"screen-256color",
		"tmux",
		"tmux-256color",
		"iTerm.app",
		"Apple_Terminal",
		"vscode",
		"alacritty",
		"kitty",
		"foot",
		"st-256color",
	]

	// Check TERM_PROGRAM (set by some terminals)
	if (supportedTerminals.includes(termProgram)) {
		return true
	}

	// Check TERM
	return supportedTerminals.some((t) => term.startsWith(t) || term === t)
}

/**
 * Copy text to clipboard with fallback message
 * @param text - The text to copy
 * @returns object with success status and whether clipboard was used
 */
export function copyToClipboardWithFeedback(text: string): { success: boolean; usedClipboard: boolean } {
	if (isClipboardSupported()) {
		const success = copyToClipboard(text)
		return { success, usedClipboard: success }
	}

	// Clipboard not supported, user will need to copy manually
	return { success: false, usedClipboard: false }
}
