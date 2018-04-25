import {ENCODING, read, write, deleteFile, WriteOptions} from "./file-promise";
import * as fs from "fs";

export default class FileInfo
{
	constructor(public readonly path:string, public encoding:string = ENCODING.UTF8)
	{

	}

	get exists():boolean
	{
		return fs.existsSync(this.path);
	}

	delete():Promise<void>
	{
		return deleteFile(this.path);
	}

	read():Promise<string>
	{
		return read(this.path, this.encoding);
	}

	write(contents:string, options?:WriteOptions):Promise<void>
	{
		return write(this.path, contents, options);
	}
}