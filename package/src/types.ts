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

import type { Database } from '.';

export type JSONValues =
	| string
	| number
	| boolean
	| null
	| JSONValues[]
	| JSObjectN;
export type JSObjectN = { [k: string]: JSONValues };

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

/** Options to make the Database */
export interface DatabaseOptions<T extends string> {
	/** Relative root directory of the database */
	root: string;
	/** Tables of the database */
	tables: T[];
	/** Authentication key for each operation */
	auth?: string;
}

/** Represents the most basic options of any function */
export interface SimpleOptions<T extends string> {
	/** Table to use */
	table: T;
	/** Authentication key */
	auth?: string;
}

/** Represents options with a key */
export interface KeyedOptions<T extends string> extends SimpleOptions<T> {
	/** Dot path key inside a table */
	key: string;
}

/** Represents options with an optional key */
export interface OptionalKeyedOptions<T extends string>
	extends SimpleOptions<T> {
	/** Dot path key inside a table */
	key?: string;
}

/** Represents options with a key and value to be set */
export interface KeyedValuedOptions<T extends string, V extends JSONValues>
	extends KeyedOptions<T> {
	/** Value to be established */
	value: V;
}

/** Represents options with a key and value to be set */
export interface OptionalKeyedValuedOptions<
	T extends string,
	V extends JSONValues
> extends OptionalKeyedOptions<T> {
	/** Value to be established */
	value: V;
}

/** Represents options with a value to be set */
export interface UnKeyedValuedOptions<T extends string>
	extends SimpleOptions<T> {
	/** Value to be established */
	value: JSObjectN;
}
