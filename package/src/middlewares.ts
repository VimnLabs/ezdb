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

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ERROR_HEADERS, ERROR_MESSAGES, KEYWORDS } from './constants';
import type { JSObjectN } from './types';
import { FillString, Log } from './utils';

export function AuthChecker<T>(auth1?: T, auth2?: T) {
	if (auth1 && auth1 !== auth2) {
		Log.panic(ERROR_HEADERS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
		throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
	}
}

export function FileChecker(path: string) {
	if (!existsSync(path)) {
		const MESSAGE = FillString({
			text: ERROR_MESSAGES.INVALID_FILE,
			keywords: {
				[KEYWORDS.FILE]: path
			}
		});
		Log.panic(ERROR_HEADERS.INVALID_FILE, MESSAGE);
		throw new Error(MESSAGE);
	}
}

export function GetTable({
	root,
	table
}: { root: string; table: string }): [JSObjectN, string] {
	const FILE = join(process.cwd(), root, `${table}.json`);
	FileChecker(FILE);
	return [JSON.parse(readFileSync(FILE).toString()), FILE];
}

export function IsSameType(value: unknown, expected: unknown) {
	if (typeof value === typeof expected) return;
	const MESSAGE = FillString({
		text: ERROR_MESSAGES.INVALID_TYPE,
		keywords: {
			[KEYWORDS.GETTED]: typeof value,
			[KEYWORDS.EXPECTED]: typeof expected
		}
	});
	Log.panic(ERROR_HEADERS.INVALID_TYPE, MESSAGE);
	throw new TypeError(MESSAGE);
}

export function IsObject(value: unknown) {
	return value !== null && !Array.isArray(value) && typeof value === 'object';
}
