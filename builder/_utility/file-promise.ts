/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import * as fs from "fs";
import { WriteFileOptions } from "fs";
import {JsonArray, JsonData, JsonMap} from "typescript-dotnet-commonjs/JSON";

export module ENCODING
{
	export const UTF8:UTF8 = 'utf8';
}

export type UTF8 = 'utf8';
export type Encoding = UTF8;


export type WriteOptions = {
	encoding?:string;
	mode?:string;
	flag?:string;
};

export function deleteFile(path:string):Promise<void>
{
	return new Promise<void>((resolve, reject)=>
	{
		fs.unlink(
			path,
			(err)=>
			{
				if(err) reject(err);
				else resolve();
			});
	});
}

function readFile(path:string, encoding:BufferEncoding = ENCODING.UTF8):Promise<string>
{
	return new Promise<string>((resolve, reject)=>
	{
		fs.readFile(
			path,
			{encoding: encoding},
			(err, data)=>
			{
				if(err) reject(err);
				else resolve(data);
			});
	});
}

function writeFile(path:string, data:string, options?:WriteFileOptions):Promise<void>
{
	return new Promise<void>((resolve, reject)=>
	{
		fs.writeFile(
			path,
			data,
			options || {},
			err=>
			{
				if(err) reject(err);
				else resolve();
			});
	});
}

export {readFile as read, writeFile as write};

export module json
{

	// noinspection JSUnusedLocalSymbols
	export function read<T extends JsonMap | JsonArray>(
		path:string,
		encoding?:BufferEncoding):Promise<T>
	// noinspection JSUnusedLocalSymbols
	export function read(path:string, encoding?:BufferEncoding):Promise<JsonData>
	export function read<T extends JsonMap | JsonArray>(
		path:string,
		encoding:BufferEncoding = ENCODING.UTF8):Promise<T>
	{
		return readFile(path, encoding)
			.then(result=>JSON.parse(result));
	}

	export function write(path:string, data:JsonData, options?:WriteFileOptions):Promise<void>
	{
		return new Promise<string>(
			resolve=>resolve(JSON.stringify(data, null, 2)))
			.then(s=>writeFile(path, s, options));
	}

}