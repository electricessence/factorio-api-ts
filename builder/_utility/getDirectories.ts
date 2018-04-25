/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import * as fs from "fs";

export function getDirectories(path:string):string[]
{
	return fs
		.readdirSync(path)
		.filter(name=>fs.statSync(path + '/' + name).isDirectory());
}

export function getDirectoriesAsync(path:string):Promise<string[]>
{
	return new Promise<string[]>((resolve, reject)=>
	{
		fs.readdir(
			path,
			(err,data)=>
			{
				if(err) reject(err);
				else resolve(data
					.filter(name=>fs.statSync(path + '/' + name).isDirectory()));
			});
	});}