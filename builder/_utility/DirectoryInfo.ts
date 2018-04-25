import * as fs from "fs";
import * as path from "path";
import FileInfo from "./FileInfo";
import {ENCODING} from "./file-promise";
import {getFilesAsync} from "./getFiles";

export default class DirectoryInfo
{
	constructor(public readonly path:string)
	{

	}

	get exists():boolean
	{
		return fs.existsSync(this.path);
	}

	async remove(force:boolean):Promise<void>
	{
		if(force) await this.clear();
		await new Promise<void>((resolve, reject)=>
		{
			fs.rmdir(
				this.path,
				(err)=>
				{
					if(err) reject(err);
					else resolve();
				});
		});
	}

	async clear():Promise<void>
	{
		for(const file of await this.files())
			await this.file(file).delete();
	}

	create():Promise<void>
	{
		return new Promise<void>((resolve, reject)=>
		{
			fs.mkdir(
				this.path,
				(err)=>
				{
					if(err) reject(err);
					else resolve();
				});
		});
	}

	files(ext?:string):Promise<string[]>
	{
		return getFilesAsync(this.path, ext);
	}

	file(fileName:string, encoding:string = ENCODING.UTF8):FileInfo
	{
		return new FileInfo(path.join(this.path, fileName), encoding);
	}

	directory(dirName:string):DirectoryInfo
	{
		return new DirectoryInfo(path.join(this.path, dirName));
	}

}