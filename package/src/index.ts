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

import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
	deepKeys,
	deleteProperty,
	escapePath,
	getProperty,
	setProperty
} from 'dot-prop';
import { TypedEmitter } from 'tiny-typed-emitter';
import { ERROR_HEADERS } from './constants';
import { AuthChecker, GetTable, IsSameType } from './middlewares';
import type {
	DatabaseEvents,
	DatabaseOptions,
	JSONValues,
	JSObjectN,
	KeyedOptions,
	KeyedValuedOptions,
	OptionalKeyedOptions,
	OptionalKeyedValuedOptions,
	SimpleOptions,
	UnKeyedValuedOptions
} from './types';
import { Insert, Log } from './utils';

/** Database class with synchronous methods */
export class Database<T extends string> extends TypedEmitter<
	DatabaseEvents<T>
> {
	/** Relative root directory of the database */
	readonly root: string;
	/** Tables of the database */
	readonly tables: T[];
	/** Authentication key for each operation */
	readonly auth?: string;

	/** Constructs the Database class */
	constructor({ root, tables, auth }: DatabaseOptions<T>) {
		super();
		this.root = root;
		this.tables = tables;
		this.auth = auth;
	}

	// Utils

	/**
	 * Sanitize an string to use.
	 *
	 * Example: If you has `{"foo.bar": null}` you must use `sanitize("foo.bar")` to access it
	 */
	public sanitize(path: string) {
		return escapePath(path);
	}

	/** You get an entire table and convert it into a flat object. */
	public flat({ table, auth }: SimpleOptions<T>) {
		AuthChecker(this.auth, auth);
		const [DATA] = GetTable({ root: this.root, table });
		return Object.fromEntries(
			deepKeys(DATA).map((k) => [k, getProperty(DATA, k)])
		);
	}

	/** Gets the contents of all tables and condenses them into a single object */
	public all(
		/** Authentication key */
		auth?: string
	) {
		AuthChecker(this.auth, auth);
		const DATA = {} as Record<T, JSObjectN>;
		for (const table of this.tables) {
			DATA[table] = this._get({ table, auth }) as JSObjectN;
		}
		return DATA;
	}

	/** Get the ping of the db */
	public ping() {
		const TIME = Date.now();
		this.all(this.auth);
		return Date.now() - TIME;
	}

	/** Begins the Database by verifying tables and creating them if they do not exist. */
	public begin(): Promise<void> {
		return new Promise((res, rej) => {
			try {
				const ROOT = join(process.cwd(), this.root);
				if (!existsSync(ROOT)) mkdirSync(ROOT);
				for (const table of this.tables) {
					const FILE = join(ROOT, `${table}.json`);
					if (!existsSync(FILE)) Insert({ path: FILE, json: {} });
				}
				this.emit('begin', this);
				res();
			} catch (e) {
				Log.panic(ERROR_HEADERS.UNEXPECTED, (e as Error).message);
				rej(e);
			}
		});
	}

	// Get function

	/** Do not use this, this function doesnt fire an event */
	private _get<V extends JSONValues>({
		table,
		key,
		auth
	}: OptionalKeyedOptions<T>): V | undefined {
		AuthChecker(this.auth, auth);
		const [DATA] = GetTable({ root: this.root, table });
		if (key) return getProperty(DATA, key) as V | undefined;
		return DATA as V | undefined;
	}

	/** You get an entire table */
	public get<V = JSObjectN>({ table, auth }: SimpleOptions<T>): V;
	/** Get a specific value of a key in the table */
	public get<V extends JSONValues>({
		table,
		key,
		auth
	}: KeyedOptions<T>): V | undefined;
	/** Get a specific value of a key in the table, or get the entire table. */
	public get<V extends JSONValues>({
		table,
		key,
		auth
	}: OptionalKeyedOptions<T>): V | undefined {
		const VALUE = this._get({ table, key, auth });
		this.emit('get', table, VALUE, key, auth);
		return VALUE as V | undefined;
	}

	/** Overwrite a table completely */
	public set({ table, auth, value }: UnKeyedValuedOptions<T>): JSObjectN;
	/** Writes a specific property */
	public set({
		table,
		key,
		auth,
		value
	}: KeyedValuedOptions<T, JSONValues>): JSObjectN;
	/** Overwrites a table completely or writes a specific property */
	public set({
		table,
		key,
		auth,
		value
	}: OptionalKeyedValuedOptions<T, JSONValues>): JSObjectN {
		AuthChecker(this.auth, auth);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		if (!key) {
			Insert({ path: PATH, json: value as JSObjectN });
			return value as JSObjectN;
		}
		setProperty(DATA, key, value);
		Insert({ path: PATH, json: DATA });
		this.emit('set', table, value, key, auth);
		return DATA;
	}

	/** Deletes a table completely */
	public delete({ table, auth }: SimpleOptions<T>): JSObjectN;
	/** Deletes a specific property */
	public delete({ table, key, auth }: KeyedOptions<T>): JSObjectN;
	/** Deletes a table completely or deletes a specific property */
	public delete({ table, key, auth }: OptionalKeyedOptions<T>): JSObjectN {
		AuthChecker(this.auth, auth);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		if (!key) {
			Insert({ path: PATH, json: {} });
			return {};
		}
		deleteProperty(DATA, key);
		Insert({ path: PATH, json: DATA });
		this.emit('delete', table, key, auth);
		return DATA;
	}

	// Number Oriented

	/** Adds a quantity to a key, if it does not exist it is created, or if it does exist and it is not a number it is overwritten with the value of the quantity to be added. */
	public sum({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		AuthChecker(this.auth, auth);
		IsSameType(value, 0);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key, 0);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0 + value);
		else setProperty(DATA, key, NUM + value);
		Insert({ path: PATH, json: DATA });
		this.emit('sum', table, DATA, key, auth);
		return DATA;
	}

	/** Subtract a quantity from a key, if it does not exist it is created, or if it does exist and it is not a number it is overwritten with the value of the quantity to be subtracted. */
	public sub({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		AuthChecker(this.auth, auth);
		IsSameType(value, 0);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0 - value);
		else setProperty(DATA, key, NUM - value);
		Insert({ path: PATH, json: DATA });
		this.emit('sub', table, DATA, key, auth);
		return DATA;
	}

	/** Multiplies a quantity to a key, if it does not exist it is created, or if it does exist and it is not a number it is overwritten with the value of the quantity to be multiplied. */
	public multi({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		AuthChecker(this.auth, auth);
		IsSameType(value, 0);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 1 * value);
		else setProperty(DATA, key, NUM * value);
		Insert({ path: PATH, json: DATA });
		this.emit('multi', table, DATA, key, auth);
		return DATA;
	}

	/** Divides a quantity to a key, if it does not exist it is created, or if it does exist and it is not a number it is overwritten with the value of 0. */
	public divide({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		AuthChecker(this.auth, auth);
		IsSameType(value, 0);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0);
		else setProperty(DATA, key, NUM / value);
		Insert({ path: PATH, json: DATA });
		this.emit('divide', table, DATA, key, auth);
		return DATA;
	}

	/** Raises a quantity to a power in a key, if it does not exist it is created, or if it does exist it is overwritten with the value of 0. */
	public pow({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		AuthChecker(this.auth, auth);
		IsSameType(value, 0);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0);
		else setProperty(DATA, key, NUM ** value);
		Insert({ path: PATH, json: DATA });
		this.emit('pow', table, DATA, key, auth);
		return DATA;
	}

	/**
	 * Gets a value from a database based on a key. If the value does not exist or is not a number, it is stored as 0. If the value is a number, it is updated with nth root of the value.
	 */
	public sqrt({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		AuthChecker(this.auth, auth);
		IsSameType(value, 0);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0);
		else setProperty(DATA, key, NUM ** (1 / value));
		Insert({ path: PATH, json: DATA });
		this.emit('sqrt', table, DATA, key, auth);
		return DATA;
	}

	// Array Oriented
	/** Pushs a value from the provided key. If the array does not exist or is not an array, then an array containing the given value will be created. */
	public push({ table, key, value, auth }: KeyedValuedOptions<T, JSONValues>) {
		AuthChecker(this.auth, auth);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) setProperty(DATA, key, [value]);
		else ARRAY.push(value);
		Insert({ path: PATH, json: DATA });
		this.emit('push', table, DATA, key, auth);
		return DATA;
	}
	/** Removes a value from the provided key. If the array does not exist or is not an array, then an empty array will be created. */
	public remove({ table, key, value, auth }: KeyedValuedOptions<T, JSONValues>) {
		AuthChecker(this.auth, auth);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) setProperty(DATA, key, []);
		else {
			const INDEX = ARRAY.indexOf(value);
			if (INDEX === -1) return DATA;
			ARRAY.splice(INDEX, 1);
			setProperty(DATA, key, ARRAY);
		}
		Insert({ path: PATH, json: DATA });
		this.emit('remove', table, DATA, key, auth);
		return DATA;
	}
	/** Adds at the begging the provided values from the provided key. If the array does not exist or is not an array, then an array containing the given value will be created. */
	public unshift({
		table,
		key,
		value,
		auth
	}: KeyedValuedOptions<T, JSONValues>) {
		AuthChecker(this.auth, auth);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) setProperty(DATA, key, [value]);
		else ARRAY.unshift(value);
		Insert({ path: PATH, json: DATA });
		this.emit('unshift', table, DATA, key, auth);
		return DATA;
	}
	/** Removes and returns the first value from the provided key. If the array does not exist or is not an array, then an empty array will be created. */
	public shift({ table, key, auth }: KeyedOptions<T>) {
		AuthChecker(this.auth, auth);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) {
			setProperty(DATA, key, []);
			Insert({ path: PATH, json: DATA });
			return [];
		}
		const OUT = ARRAY.shift();
		setProperty(DATA, key, ARRAY);
		Insert({ path: PATH, json: DATA });
		this.emit('shift', table, DATA, OUT, key, auth);
		return OUT;
	}
	/** Removes and returns the last value from the provided key. If the array does not exist or is not an array, then an empty array will be created. */
	public pop({ table, key, auth }: KeyedOptions<T>) {
		AuthChecker(this.auth, auth);
		const [DATA, PATH] = GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) {
			setProperty(DATA, key, []);
			Insert({ path: PATH, json: DATA });
			return [];
		}
		const OUT = ARRAY.pop();
		setProperty(DATA, key, ARRAY);
		Insert({ path: PATH, json: DATA });
		this.emit('shift', table, DATA, OUT, key, auth);
		return OUT;
	}
}

export * from './constants';
export * from './middlewares';
export * from './types';
export * from './utils';
