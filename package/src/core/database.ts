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
import { ERROR_HEADERS } from '../constants';
import * as Middleware from '../middlewares';
import type { JSONValues, JSObjectN } from '../types';
import * as Util from '../utils';
import type { DatabaseEvents } from './events';

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

/** Database class */
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
		Middleware.AuthChecker(this.auth, auth);
		const [DATA] = Middleware.GetTable({ root: this.root, table });
		return Object.fromEntries(
			deepKeys(DATA).map((k) => [k, getProperty(DATA, k)])
		);
	}

	/** Gets the contents of all tables and condenses them into a single object */
	public async all(
		/** Authentication key */
		auth?: string
	) {
		Middleware.AuthChecker(this.auth, auth);
		const DATA = {} as Record<T, JSObjectN>;
		for (const table of this.tables) {
			DATA[table] = (await this._get({ table, auth })) as JSObjectN;
		}
		return DATA;
	}

	/** Get the ping of the db */
	public async ping() {
		const TIME = Date.now();
		await this.all(this.auth);
		return Date.now() - TIME;
	}

	/** Begins the Database by verifying tables and creating them if they do not exist. */
	public begin(): Promise<void> {
		return new Promise((_, rej) => {
			try {
				const ROOT = join(process.cwd(), this.root);
				if (!existsSync(ROOT)) mkdirSync(ROOT);
				for (const table of this.tables) {
					const FILE = join(ROOT, `${table}.json`);
					if (!existsSync(FILE)) Util.Insert({ path: FILE, json: {} });
				}
				this.emit('begin', this);
			} catch (e) {
				Util.LogEzDB.panic(ERROR_HEADERS.UNEXPECTED, (e as Error).message);
				rej(e);
			}
		});
	}

	// Get function

	/** Do not use this, this function doesnt fire an event */
	private async _get<V extends JSONValues>({
		table,
		key,
		auth
	}: OptionalKeyedOptions<T>): Promise<V | undefined> {
		Middleware.AuthChecker(this.auth, auth);
		const [DATA] = Middleware.GetTable({ root: this.root, table });
		if (key) return getProperty(DATA, key) as V | undefined;
		return DATA as V | undefined;
	}

	/** You get an entire table */
	public async get<V = JSObjectN>({ table, auth }: SimpleOptions<T>): Promise<V>;
	/** Get a specific value of a key in the table */
	public async get<V extends JSONValues>({
		table,
		key,
		auth
	}: KeyedOptions<T>): Promise<V | undefined>;
	/** Get a specific value of a key in the table, or get the entire table. */
	public async get<V extends JSONValues>({
		table,
		key,
		auth
	}: OptionalKeyedOptions<T>): Promise<V | undefined> {
		const VALUE = await this._get({ table, key, auth });
		this.emit('get', table, VALUE, key, auth);
		return VALUE as V | undefined;
	}

	/** Overwrite a table completely */
	public async set({
		table,
		auth,
		value
	}: UnKeyedValuedOptions<T>): Promise<JSObjectN>;
	/** Writes a specific property */
	public async set({
		table,
		key,
		auth,
		value
	}: KeyedValuedOptions<T, JSONValues>): Promise<JSObjectN>;
	/** Overwrites a table completely or writes a specific property */
	public async set({
		table,
		key,
		auth,
		value
	}: OptionalKeyedValuedOptions<T, JSONValues>): Promise<JSObjectN> {
		Middleware.AuthChecker(this.auth, auth);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		if (!key) {
			Util.Insert({ path: PATH, json: value as JSObjectN });
			return value as JSObjectN;
		}
		setProperty(DATA, key, value);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('set', table, value, key, auth);
		return DATA;
	}

	/** Deletes a table completely */
	public async delete({ table, auth }: SimpleOptions<T>): Promise<JSObjectN>;
	/** Deletes a specific property */
	public async delete({ table, key, auth }: KeyedOptions<T>): Promise<JSObjectN>;
	/** Deletes a table completely or deletes a specific property */
	public async delete({
		table,
		key,
		auth
	}: OptionalKeyedOptions<T>): Promise<JSObjectN> {
		Middleware.AuthChecker(this.auth, auth);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		if (!key) {
			Util.Insert({ path: PATH, json: {} });
			return {};
		}
		deleteProperty(DATA, key);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('delete', table, key, auth);
		return DATA;
	}

	// Number Oriented

	/** Adds a quantity to a key, if it does not exist it is created, or if it does exist and it is not a number it is overwritten with the value of the quantity to be added. */
	public async sum({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		Middleware.AuthChecker(this.auth, auth);
		Middleware.IsSameType(value, 0);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key, 0);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0 + value);
		else setProperty(DATA, key, NUM + value);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('sum', table, DATA, key, auth);
		return DATA;
	}

	/** Subtract a quantity from a key, if it does not exist it is created, or if it does exist and it is not a number it is overwritten with the value of the quantity to be subtracted. */
	public async sub({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		Middleware.AuthChecker(this.auth, auth);
		Middleware.IsSameType(value, 0);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0 - value);
		else setProperty(DATA, key, NUM - value);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('sub', table, DATA, key, auth);
		return DATA;
	}

	/** Multiplies a quantity to a key, if it does not exist it is created, or if it does exist and it is not a number it is overwritten with the value of the quantity to be multiplied. */
	public async multi({
		table,
		key,
		value,
		auth
	}: KeyedValuedOptions<T, number>) {
		Middleware.AuthChecker(this.auth, auth);
		Middleware.IsSameType(value, 0);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 1 * value);
		else setProperty(DATA, key, NUM * value);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('multi', table, DATA, key, auth);
		return DATA;
	}

	/** Divides a quantity to a key, if it does not exist it is created, or if it does exist and it is not a number it is overwritten with the value of 0. */
	public async divide({
		table,
		key,
		value,
		auth
	}: KeyedValuedOptions<T, number>) {
		Middleware.AuthChecker(this.auth, auth);
		Middleware.IsSameType(value, 0);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0);
		else setProperty(DATA, key, NUM / value);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('divide', table, DATA, key, auth);
		return DATA;
	}

	/** Raises a quantity to a power in a key, if it does not exist it is created, or if it does exist it is overwritten with the value of 0. */
	public async pow({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		Middleware.AuthChecker(this.auth, auth);
		Middleware.IsSameType(value, 0);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0);
		else setProperty(DATA, key, NUM ** value);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('pow', table, DATA, key, auth);
		return DATA;
	}

	/**
	 * Gets a value from a database based on a key. If the value does not exist or is not a number, it is stored as 0. If the value is a number, it is updated with nth root of the value.
	 */
	public async sqrt({ table, key, value, auth }: KeyedValuedOptions<T, number>) {
		Middleware.AuthChecker(this.auth, auth);
		Middleware.IsSameType(value, 0);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const NUM = getProperty(DATA, key);
		if (typeof NUM !== 'number') setProperty(DATA, key, 0);
		else setProperty(DATA, key, NUM ** (1 / value));
		Util.Insert({ path: PATH, json: DATA });
		this.emit('sqrt', table, DATA, key, auth);
		return DATA;
	}

	// Array Oriented
	/** Pushs a value from the provided key. If the array does not exist or is not an array, then an array containing the given value will be created. */
	public async push({
		table,
		key,
		value,
		auth
	}: KeyedValuedOptions<T, JSONValues>) {
		Middleware.AuthChecker(this.auth, auth);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) setProperty(DATA, key, [value]);
		else ARRAY.push(value);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('push', table, DATA, key, auth);
		return DATA;
	}
	/** Removes a value from the provided key. If the array does not exist or is not an array, then an empty array will be created. */
	public async remove({
		table,
		key,
		value,
		auth
	}: KeyedValuedOptions<T, JSONValues>) {
		Middleware.AuthChecker(this.auth, auth);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) setProperty(DATA, key, []);
		else {
			const INDEX = ARRAY.indexOf(value);
			if (INDEX === -1) return DATA;
			ARRAY.splice(INDEX, 1);
			setProperty(DATA, key, ARRAY);
		}
		Util.Insert({ path: PATH, json: DATA });
		this.emit('remove', table, DATA, key, auth);
		return DATA;
	}
	/** Adds at the begging the provided values from the provided key. If the array does not exist or is not an array, then an array containing the given value will be created. */
	public async unshift({
		table,
		key,
		value,
		auth
	}: KeyedValuedOptions<T, JSONValues>) {
		Middleware.AuthChecker(this.auth, auth);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) setProperty(DATA, key, [value]);
		else ARRAY.unshift(value);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('unshift', table, DATA, key, auth);
		return DATA;
	}
	/** Removes and returns the first value from the provided key. If the array does not exist or is not an array, then an empty array will be created. */
	public async shift({ table, key, auth }: KeyedOptions<T>) {
		Middleware.AuthChecker(this.auth, auth);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) {
			setProperty(DATA, key, []);
			Util.Insert({ path: PATH, json: DATA });
			return [];
		}
		const OUT = ARRAY.shift();
		setProperty(DATA, key, ARRAY);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('shift', table, DATA, OUT, key, auth);
		return OUT;
	}
	/** Removes and returns the last value from the provided key. If the array does not exist or is not an array, then an empty array will be created. */
	public async pop({ table, key, auth }: KeyedOptions<T>) {
		Middleware.AuthChecker(this.auth, auth);
		const [DATA, PATH] = Middleware.GetTable({ root: this.root, table });
		const ARRAY = getProperty(DATA, key);
		if (!Array.isArray(ARRAY)) {
			setProperty(DATA, key, []);
			Util.Insert({ path: PATH, json: DATA });
			return [];
		}
		const OUT = ARRAY.pop();
		setProperty(DATA, key, ARRAY);
		Util.Insert({ path: PATH, json: DATA });
		this.emit('shift', table, DATA, OUT, key, auth);
		return OUT;
	}
}
