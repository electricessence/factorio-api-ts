import {json} from "./_utility/file-promise";
import DirectoryInfo from "./_utility/DirectoryInfo";
import {JsonMap} from "typescript-dotnet-commonjs/JSON";
import {DefinesNode} from "./DefinesNode";
import {IMap} from "typescript-dotnet-commonjs/IMap";
import {ClassesNode, ClassMember} from "./ClassesNode";

async function generateDefineTypes(dir: DirectoryInfo, node: JsonMap | IMap<DefinesNode>) {
	if (!dir.exists) await dir.create();
	else dir.clear();

	for (const m of Object.keys(node)) {
		const n: DefinesNode = <any>node[m];
		const children: IMap<DefinesNode> = n.properties;
		const e = Object.keys(children)
			.filter(k => children[k].name);

		if (e.length == 0) {
			await generateDefineTypes(dir.directory(m), n.properties);
		}

		else {
			const template = [
				`declare enum ${m}`,
				`{`,
				e.map(k => `	${k},`).join('\n'),
				`}`,
				``,
				`export default ${m};`
			];

			await dir
				.file(`${m}.d.ts`)
				.write(template.join('\n'));

		}
	}
}

async function generateClassesTypes(dir: DirectoryInfo, node: JsonMap | IMap<ClassesNode>) {
	if (!dir.exists) await dir.create();
	else dir.clear();

	for (const m of Object.keys(node)) {
		const n: ClassesNode = <any>node[m];
		const children: IMap<ClassMember> = n.properties;

		const members:string[] = [];

		for(const c in children)
		{
			const {type, name, doc} = children[c];

			if(doc) {
				members.push(`/**`);
				members.push(` ${doc.split('\n').join('\n\t ')}`);
				members.push(` **/`)
			}

			switch (type)
			{
				case 'function':

					members.push(`${name}();`);
					members.push(``);
					break;

				default:
					members.push(`${name}: ${type};`);
					break;
			}
		}

		const template = [
			`declare class ${m}`,
			`{`,
			"\t"+members.join('\n\t'),
			`}`,
			``,
			`export default ${m};`
		];

		if(n.doc) template.unshift(`/** ${n.doc} **/`);

		await dir
			.file(`${m}.d.ts`)
			.write(template.join('\n'));
	}
}

export async function run() {

	const typesDir = new DirectoryInfo("./types");

	await generateDefineTypes(
		typesDir.directory("defines"),
		await json.read<JsonMap>("./definition/defines.json"));

	await generateClassesTypes(
		typesDir.directory("classes"),
		await json.read<JsonMap>("./definition/classes.json"));
}