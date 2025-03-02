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

import type { JSONValues } from '../types';
import type { Backup, BackupInfo } from './backup';
import type { Database } from './database';

export interface DatabaseEvents<T extends string> {
	begin: (database: Database<T>) => void;
	get: (
		table: T,
		json: JSONValues | undefined,
		key?: string,
		auth?: string
	) => void;
	set: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	delete: (table: T, key?: string, auth?: string) => void;
	sum: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	sub: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	multi: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	divide: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	pow: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	sqrt: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	push: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	remove: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	unshift: (table: T, json: JSONValues, key?: string, auth?: string) => void;
	shift: (
		table: T,
		json: JSONValues,
		value: JSONValues | undefined,
		key?: string,
		auth?: string
	) => void;
	pop: (
		table: T,
		json: JSONValues,
		value: JSONValues | undefined,
		key?: string,
		auth?: string
	) => void;
}

export interface BackupEvents {
	begin: (backup: Backup) => void;
	start: (path: string, backup: Backup) => void;
	open_folder: (path: string, backup: Backup) => void;
	open_file: (path: string, backup: Backup) => void;
	end: (output: string, backup: Backup) => void;
	use: (info: BackupInfo, backup: Backup) => void;
}
