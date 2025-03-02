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

export enum KEYWORDS {
	FILE = 'file',
	GETTED = 'getted',
	EXPECTED = 'expected',
	ID = 'id'
}

export enum ERROR_MESSAGES {
	UNAUTHORIZED = 'There is no authorization to complete this request.',
	INVALID_FILE = 'The file “{file}” does not exist or is misspelled.',
	INVALID_TYPE = 'A value of type {getted} cannot be assigned to type {expected}.',
	INVALID_BACKUP = 'No backup was found with the id or timestamp “{getted}”.'
}

export enum ERROR_HEADERS {
	UNAUTHORIZED = 'Unauthorized',
	INVALID_FILE = 'Invalid File',
	UNEXPECTED = 'Unexpected Error',
	INVALID_TYPE = 'Invalid Type',
	INVALID_BACKUP = 'Invalid Backup'
}

export enum VERBOSE_PROCESS {
	START = 'Start',
	OPEN_FOLDER = 'Open Folder',
	OPEN_FILE = 'Open File',
	END = 'End',
	USE = 'Use'
}

export enum VERBOSE_PROCESS_MESSAGE {
	START = 'A backup is started, directory to be backed up:',
	OPEN_FOLDER = 'The folder has opened:',
	OPEN_FILE = 'The file has opened:',
	END = 'The backup was done correctly, resulting backup:',
	USE = 'Restore from backup was successful, copy used:'
}
