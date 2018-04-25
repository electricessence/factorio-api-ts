/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import * as fs from "fs";

export function getFiles(path:string, ext?:string):string[]
{
	return fs
		.readdirSync(path)
		.filter((name)=>
			(!ext || name.lastIndexOf(ext)==name.length - ext.length)
			&& fs.statSync(path + '/' + name).isFile());
}


export function getFilesAsync(path:string, ext?:string):Promise<string[]>
{
	return new Promise<string[]>((resolve, reject)=>
	{
		fs.readdir(
			path,
			(err,data)=>
			{
				if(err) reject(err);
				else resolve(data
					.filter((name)=>
						(!ext || name.lastIndexOf(ext)==name.length - ext.length)
						&& fs.statSync(path + '/' + name).isFile()));
			});
	});
}