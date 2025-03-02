//.,,,,,...........,,,,,..,,,,,....,,,,,.............,,,,....,,,,,.........,,,,,..//
//.,S@@@+.........,S@@@?..+@@@@:...*@@@#:...........?@@@*....+@@@#+........;%%%*..//
//..;@@@@:........%@@@#,..+@@@@;...*@@@@S,.........+@@@%.....+@@@@@?,......+%%%?..//
//...*@@@S,......+@@@@;...+@@@@:...*@@@@@S,.......;@@@S,.....+@@@@@@S:.....+%%%?..//
//...,S@@@*.....:@@@@?....+@@@@:...*@@@@@@%,.....:@@@#,......+@@@@@@@#;....+%%%?..//
//....:@@@@;...,S@@@#,....+@@@@:...*@@@#@@@?....,#@@@:..+,...+@@@%;#@@@*...+S%%?..//
//.....*@@@#,..*@@@@:.....+@@@@:...*@@@?+@@@?..,S@@@;..+#,...+@@@%.:S@@@%,.,*%%?..//
//......%@@@?..;@@@*......+@@@@:...*@@@?.?@@@*.?@@@*..;@#,...+@@@%..,?@@@S:..;%?..//
//......,#@@@+..*@S.......+@@@@:...*@@@?..?@@@%@@@?..:#@#,...+@@@%....+@@@@+..:*..//
//.......+@@@#,.,%:.......+@@@@:...*@@@?...%@@@@@%,.,S@@#,...+@@@%.....;#@@@*..,..//
//........?@@@%...........+@@@@;...*@@@?...,%###S,..,@@@#,...+@@@%......,%@@@%,...//
//........,S###+..........+####:...*@@@?............,###S,...+###?........*@@@S:..//
//.........,,,,,..........,,,,,....,,,,,.............,,,,....,,,,,.........,,,,,..//

/** Fills a string with the provided keywords */
export function FillString({
	text,
	keywords
}: {
	text: string;
	keywords: Record<string, string>;
}) {
	return text.replace(/\{([^}]+)\}/g, (_, key) => keywords[key] ?? `{${key}}`);
}

import { writeFileSync } from 'node:fs';
import type { JSObjectN } from './types';

/** Inserts JSON data in a file */
export function Insert({ path, json }: { path: string; json: JSObjectN }) {
	writeFileSync(path, JSON.stringify(json, null, 2));
}

//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,//
//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,//
//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,// This Logger was extracted and modified from “Kodkord” by “Kodeko Studios”.
//,,,,,,,,,,,.......,,,,,,,,,,,..........,,,,,,,,,,,// I would appreciate if you visit and support the Kodkord project.
//,,,,,,,,,,,;;;;;;;;,,,,,,,,..:********+,,,,,,,,,,,//
//,,,,,,,,,,:???????*,,,,,,.,:?######@S+,,,,,,,,,,,,// You can see it in the following link:
//,,,,,,,,,,:******+:,,,,.,;%#######%+,.,,,,,,,,,,,,// > https://github.com/KodekoStudios/Kodkord
//,,,,,,,,,,:**?*+:,,,,.,;%#######%;,.,,,,,,,,,,,,,,//
//,,,,,,,,,,:?*+:,,,,.,+%#######%;,.,,,,,,,,,,,,,,,,// Exact place where I extracted it:
//,,,,,,,,,,:+,,,,,.,+S#######?;,.,,,,,,,,,,,,,,,,,,// > https://github.com/KodekoStudios/Kodkord/blob/main/packages/kodkord/src/common/log.ts
//,,,,,,,,,,,,,,,.,+S########S;..,,,,,,,,,,,,,,,,,,,//
//,,,,,,,,,,,,,.:*S############?:.,,,,,,,,,,,,,,,,,,//
//,,,,,,,,,,,.:*S######SS#######S*,.,,,,,,,,,,,,,,,,//
//,,,,,,,,,,,?#######S+,,*S#######S+,.,,,,,,,,,,,,,,//
//,,,,,,,,,.;#######S,.,,.:?########%;..,,,,,,,,,,,,//
//,,,,,,,,,.;#######S,,,,,..;%########?:.,,,,,,,,,,,// Modified by:
//,,,,,,,,,.;#######S,,,,,,,.,;S######@#*,,,,,,,,,,,// > https://github.com/KingsBeCattz
//,,,,,,,,,,:++++++++,,,,,,,,,.,++++++++*;,,,,,,,,,,//
//,,,,,,,,,,,........,,,,,,,,,,,.........,,,,,,,,,,,// Logger maded by:
//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,// > https://github.com/Pavez7274
//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,//
//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,//

export type LogLevelsKeys = keyof typeof LogLevels;
export enum LogLevels {
	Panic = 41,
	Warn = 43,
	Note = 44,
	Trace = 45
}

/**
 * Enum representing various ANSI escape codes for styling text and backgrounds.
 *
 * Includes codes for text styles, text colors, and background colors.
 * Reset codes are also provided to clear specific styles.
 */
export enum ANSICodes {
	// Reset
	ResetAll = 0,
	ResetBold = 22,
	ResetItalic = 23,
	ResetUnderline = 24,
	ResetBlik = 25,
	ResetInverse = 27,
	ResetHidden = 28,
	ResetStrikethrough = 29,
	ResetColor = 39,
	ResetBgColor = 49,

	// Text Styles
	Bold = 1,
	Dim = 2,
	Italic = 3,
	Underline = 4,
	Blink = 5,
	Inverse = 7,
	Hidden = 8,
	Strikethrough = 9,

	// Text Colors
	RGBColor = '38;2',
	BITColor = '38;5',
	RGBBackground = '48;2',
	BITBackground = '48;5',

	// Text Colors
	Black = 30,
	Red = 31,
	Green = 32,
	Yellow = 33,
	Blue = 34,
	Magenta = 35,
	Cyan = 36,
	White = 37,

	// Bright Text Colors
	BrightBlack = 90,
	BrightRed = 91,
	BrightGreen = 92,
	BrightYellow = 93,
	BrightBlue = 94,
	BrightMagenta = 95,
	BrightCyan = 96,
	BrightWhite = 97,

	// Background Colors
	BgBlack = 40,
	BgRed = 41,
	BgGreen = 42,
	BgYellow = 43,
	BgBlue = 44,
	BgMagenta = 45,
	BgCyan = 46,
	BgWhite = 47,

	// Bright Background Colors
	BgBrightBlack = 100,
	BgBrightRed = 101,
	BgBrightGreen = 102,
	BgBrightYellow = 103,
	BgBrightBlue = 104,
	BgBrightMagenta = 105,
	BgBrightCyan = 106,
	BgBrightWhite = 107
}

/**
 * Provides a lightweight, extensible logging mechanism with customizable formatting.
 *
 * The `Loggable` class is designed to be extended and used for temporary logging purposes,
 * avoiding the memory overhead of persistent logger instances. Each instance is created
 * when needed and goes out of scope once used, improving performance.
 *
 * (Class unmodified except for five original source functions).
 */
export class Loggable {
	constructor(public PACKAGE: string) {}
	/** Logs the message to the console as a standard note. */
	public note(header: string, ...messages: string[]): void {
		console.log(this.format(header, 'Note', [ANSICodes.BgBlue], ...messages));
	}

	/** Logs the message to the console with a debug level. */
	public trace(header: string, ...messages: string[]): void {
		console.debug(
			this.format(header, 'Trace', [ANSICodes.BgMagenta], ...messages)
		);
	}

	/** Logs the message to the console as a warning. */
	public warn(header: string, ...messages: string[]): void {
		console.warn(this.format(header, 'Warn', [ANSICodes.BgYellow], ...messages));
	}

	/** Logs the message to the console as an error. */
	public panic(header: string, ...messages: string[]): void {
		console.error(this.format(header, 'Panic', [ANSICodes.BgRed], ...messages));
	}

	/**
	 * Formats the log into a styled string suitable for console output.
	 *
	 * The format includes the log header, timestamp, and a separator.
	 *
	 * Modified to give the ansi codes of the background
	 *
	 * @param codes Ansi codes for styling
	 * @returns A formatted log string
	 */
	public format(
		header: string,
		level: LogLevelsKeys | string,
		codes: ANSICodes[],
		...message: string[]
	): string {
		const DATE = new Date();
		const TIME = `${DATE.toLocaleDateString()} ${DATE.toLocaleTimeString()}`;
		const HEADER = ` Vimn > ${this.PACKAGE} > ${level} > ${header} `;
		const SEPARATOR = '-'.repeat(
			Math.max(
				0,
				Math.round(process.stdout.columns / 1.5) - HEADER.length - TIME.length
			)
		);

		return `\n${stylize(HEADER, ...codes)} ${stylize(SEPARATOR, ANSICodes.Dim)} ${stylize(TIME, ANSICodes.Dim)}\n${this.formatLines(message)}`;
	}

	/**
	 * Formats the individual lines of the log with a consistent style.
	 *
	 * Each line is prefixed with a vertical bar (`|`) for clarity.
	 * @returns A formatted string containing all log lines
	 */
	public formatLines(lines: string[]): string {
		return stylize(
			lines.map((line) => line.replace(/(\n?)(.+)/g, '$1 | $2')).join('\n'),
			ANSICodes.Dim
		);
	}

	/**
	 * Converts the log entry into an `Error` object.
	 *
	 * The resulting `Error` will contain the concatenated lines of the log as its message.
	 *
	 * @returns An `Error` object representing the log entry
	 */
	public toError(lines: string[]): Error {
		return new Error(lines.join('\n'));
	}
}

/**
 * Stylizes the given string by applying the specified ANSI codes.
 *
 * The function resets specific styles automatically, such as text color, background color,
 * or other text formatting, based on the provided ANSI codes.
 *
 * @param input The string to be stylized.
 * @param codes ANSI codes to apply to the string.
 * @returns The stylized string with the applied ANSI codes.
 */
export function stylize(input: string, ...codes: ANSICodes[]): string {
	const RESET = new Set<ANSICodes>();

	for (const CODE of codes) {
		const IS_NUMBER = typeof CODE === 'number';

		if (
			(IS_NUMBER && ((CODE >= 30 && CODE <= 37) || (CODE >= 90 && CODE <= 97))) ||
			CODE === ANSICodes.RGBColor ||
			CODE === ANSICodes.BITColor
		) {
			RESET.add(ANSICodes.ResetColor);
		} else if (
			(IS_NUMBER &&
				((CODE >= 40 && CODE <= 47) || (CODE >= 100 && CODE <= 107))) ||
			CODE === ANSICodes.RGBBackground ||
			CODE === ANSICodes.BITBackground
		) {
			RESET.add(ANSICodes.ResetBgColor);
		} else if (CODE in ANSICodes && !ANSICodes[CODE].startsWith('Reset')) {
			RESET.add(
				ANSICodes[`Reset${ANSICodes[CODE]}` as keyof typeof ANSICodes] as ANSICodes
			);
		}
	}

	return ansi(...codes) + input + ansi(...Array.from(RESET));
}

/**
 * Generates an ANSI escape sequence for the provided ANSI codes.
 *
 * This function returns a valid ANSI escape sequence that can be used
 * to style text in a terminal.
 *
 * @param codes ANSI codes to include in the escape sequence.
 * @returns The ANSI escape sequence as a string.
 */
export function ansi(...codes: ANSICodes[]): `\u001B[${string}m` {
	return `\x1b[${codes.join(';')}m` as const;
}

export const LogEzDB = new Loggable('EzDB');
export const LogBackup = new Loggable('Backuper');
