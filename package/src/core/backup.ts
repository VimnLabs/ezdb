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

import {
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { join, relative } from 'node:path';
import AdmZip from 'adm-zip';
import { setProperty } from 'dot-prop';
import { TypedEmitter } from 'tiny-typed-emitter';
import {
	ERROR_HEADERS,
	ERROR_MESSAGES,
	KEYWORDS,
	VERBOSE_PROCESS,
	VERBOSE_PROCESS_MESSAGE
} from '../constants';
import { ID } from '../middlewares';
import { FillString, Insert, LogBackup } from '../utils';
import type { BackupEvents } from './events';

/** Verbose options, this are events to notify */
export interface VerboseOptions {
	/** Records when a backup process starts */
	start?: boolean;
	/** Logs when a folder to be backed up is opened */
	open_folder?: boolean;
	/** Logs when a file to be backed up is opened */
	open_file?: boolean;
	/** Records when a backup process ends */
	end?: boolean;
	/** Records when a backup is used */
	use?: boolean;
}

/** Represents the options of the backup */
export interface BackupOptions {
	/** Folder to save any backup */
	backups: string;
	/** Folder or file to backup */
	path: string;
	/** Heartbeat or interval in miliseconds to backup */
	heartbeat: number;
	/** Select whether you prefer to be notified of any process. Default: Only the start and end are notified */
	verbose?: null | VerboseOptions;
}

/** Represents the information of a backup */
export type BackupInfo = {
	/** Id with which it appears in the registry */
	id: string;
	/** Route to which the backing belongs */
	path: string;
	/** Exact time at which it was made */
	timestamp: Date;
	/** Files contained in the backup */
	entries: string[];
};

/** Create an new backup instance */
export class Backup extends TypedEmitter<BackupEvents> {
	/** Folder to save any backup */
	backups: string;
	/** Folder or file to backup */
	path: string;
	/** Heartbeat or interval in miliseconds to backup */
	heartbeat: number;
	/** Select whether you prefer to be notified of any process. Default: Only the start and end are notified */
	verbose: VerboseOptions;
	constructor({ backups, path, heartbeat, verbose }: BackupOptions) {
		super();
		this.backups = backups;
		this.path = path;
		this.heartbeat = heartbeat;
		this.verbose = verbose ?? {
			start: true,
			end: true
		};
	}

	/** Get the registry of any backup */
	public get registry(): Record<string, string> {
		return JSON.parse(
			readFileSync(join(process.cwd(), this.backups, 'index.json')).toString()
		);
	}

	private pathEntries(root = this.path): string[] {
		const results: string[] = [];

		function _(currentDir: string) {
			const entries = readdirSync(currentDir);
			for (const entry of entries) {
				const fullPath = join(currentDir, entry);
				const stat = statSync(fullPath);
				const relativePath = relative(root, fullPath).replace(/\\/g, '/');

				if (stat.isDirectory()) {
					results.push(`${relativePath}/`);
					_(fullPath);
				} else {
					results.push(relativePath);
				}
			}
		}

		_(root);
		return results;
	}

	private async checkFiles() {
		const BACKUPS = join(process.cwd(), this.backups);
		const INDEX = join(BACKUPS, 'index.json');

		if (!existsSync(BACKUPS)) mkdirSync(BACKUPS);

		if (!existsSync(INDEX)) writeFileSync(INDEX, '{}');
	}

	/** Start the automatic backup system and create all necessary files and folders. */
	public begin() {
		return new Promise((res, rej) => {
			const BACKUPS = join(process.cwd(), this.backups);
			const INDEX = join(BACKUPS, 'index.json');
			const PATH = join(process.cwd(), this.path);
			if (!existsSync(PATH)) {
				const MESSAGE = FillString({
					text: ERROR_MESSAGES.INVALID_FILE,
					keywords: {
						[KEYWORDS.FILE]: this.path
					}
				});
				LogBackup.panic(ERROR_HEADERS.INVALID_FILE, MESSAGE);
				rej(MESSAGE);
			}

			if (!existsSync(BACKUPS)) mkdirSync(BACKUPS);

			if (!existsSync(INDEX)) writeFileSync(INDEX, '{}');

			try {
				this.emit('begin', this);
				this.create();
				setInterval(() => this.create(), this.heartbeat);
				res(true);
			} catch (e) {
				LogBackup.panic(ERROR_HEADERS.UNEXPECTED, (e as Error).message);
				rej(e);
			}
		});
	}

	/**
	 * Creates a backup
	 * @returns Return the backup info
	 */
	public create(): Promise<BackupInfo> {
		return new Promise((res, rej) => {
			try {
				Promise.resolve(this.checkFiles());
				const DATE = new Date();
				const BACKUPS = join(process.cwd(), this.backups);
				const INDEX = join(BACKUPS, 'index.json');
				const BACKUP_FOLDER = join(
					BACKUPS,
					`${DATE.getMonth() + 1}-${DATE.getDate()}-${DATE.getFullYear()}`
				);
				if (!existsSync(BACKUP_FOLDER)) mkdirSync(BACKUP_FOLDER);
				const FILE_ID = ID(DATE.valueOf());
				const PATH = join(process.cwd(), this.path);
				if (this.verbose.start)
					LogBackup.trace(
						VERBOSE_PROCESS.START,
						VERBOSE_PROCESS_MESSAGE.START,
						PATH
					);
				this.emit('start', PATH, this);
				const ZIP = new AdmZip();
				const OUT = join(BACKUP_FOLDER, `${FILE_ID}.zip`);

				if (!existsSync(PATH)) {
					const MESSAGE = FillString({
						text: ERROR_MESSAGES.INVALID_FILE,
						keywords: {
							[KEYWORDS.FILE]: this.path
						}
					});
					LogBackup.panic(ERROR_HEADERS.INVALID_FILE, MESSAGE);
					throw new Error(MESSAGE);
				}

				if (lstatSync(PATH).isDirectory()) {
					if (this.verbose.open_folder)
						LogBackup.trace(
							VERBOSE_PROCESS.OPEN_FOLDER,
							VERBOSE_PROCESS_MESSAGE.OPEN_FOLDER,
							PATH
						);
					this.emit('open_folder', PATH, this);
					ZIP.addLocalFolder(PATH);
				} else {
					if (this.verbose.open_file)
						LogBackup.trace(
							VERBOSE_PROCESS.OPEN_FILE,
							VERBOSE_PROCESS_MESSAGE.OPEN_FILE,
							PATH
						);
					this.emit('open_file', PATH, this);
					ZIP.addLocalFile(PATH);
				}

				Insert({
					path: INDEX,
					json: setProperty(
						JSON.parse(readFileSync(INDEX).toString()),
						String(DATE.valueOf()),
						OUT
					)
				});
				if (this.verbose.end)
					LogBackup.trace(VERBOSE_PROCESS.END, VERBOSE_PROCESS_MESSAGE.END, OUT);
				this.emit('end', OUT, this);
				ZIP.writeZip(OUT);
				res({
					id: FILE_ID,
					path: OUT,
					timestamp: DATE,
					entries: ZIP.getEntries().map((e) => e.entryName)
				});
			} catch (e) {
				LogBackup.panic(ERROR_HEADERS.UNEXPECTED, (e as Error).message);
				rej(e);
			}
		});
	}

	/**
	 * Get all the information from a backup
	 * @param search String to use as a search string
	 */
	public info(search: string): BackupInfo | null {
		const X = this.registry[search];
		if (!X) {
			const REGEXP = new RegExp(
				`(${search.endsWith('.zip') ? search : `${search}.zip`})`,
				'g'
			);
			const [key, path] =
				Object.entries(this.registry).find(
					([_key, _path]) =>
						_key === search ||
						REGEXP.test(_path.includes('\\') ? _path.split('\\').at(-1)! : _path)
				) ?? [];
			if (!key || !path) return null;
			console.log(key, path.match(REGEXP));
			const id = path.match(REGEXP)![0].replace('.zip', '');

			return {
				id,
				path,
				timestamp: new Date(Number(key)),
				entries: new AdmZip(path).getEntries().map((e) => e.entryName)
			};
		}

		return {
			id: search,
			path: X,
			timestamp: new Date(Number(search)),
			entries: new AdmZip(X).getEntries().map((e) => e.entryName)
		};
	}

	/**
	 * This can be either the timestamp or the zip name.
	 *
	 * If the timestamp is given, the direct path will be obtained from the registry, otherwise it will be used by searching inside the registry for a timestamp that has that backup.
	 * @param id Timestamp or id to search
	 * @returns Return `true` if everything went well, otherwise any errors will be logged and reissued.
	 */
	public use(id: string): Promise<true> {
		return new Promise((res, rej) => {
			try {
				const BACKUP = this.info(id);
				if (!BACKUP) {
					const MESSAGE = FillString({
						text: ERROR_MESSAGES.INVALID_BACKUP,
						keywords: {
							[KEYWORDS.GETTED]: id
						}
					});
					LogBackup.panic(ERROR_HEADERS.INVALID_BACKUP, MESSAGE);
					rej(MESSAGE);
					return;
				}

				const ZIP = new AdmZip(BACKUP.path);
				ZIP.extractAllTo(this.path, true);
				const ZIP_SET = new Set(ZIP.getEntries().map((e) => e.entryName));
				for (const FILE of this.pathEntries().filter((v) => !ZIP_SET.has(v)))
					rmSync(join(process.cwd(), this.path, FILE));

				if (this.verbose.start)
					LogBackup.trace(
						VERBOSE_PROCESS.USE,
						VERBOSE_PROCESS_MESSAGE.USE,
						BACKUP.path
					);
				this.emit('use', BACKUP, this);
				res(true);
			} catch (e) {
				LogBackup.panic(ERROR_HEADERS.UNEXPECTED, (e as Error).message);
				rej(e);
			}
		});
	}
}
