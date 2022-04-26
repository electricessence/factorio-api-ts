import { json } from "./_utility/file-promise";
import DirectoryInfo from "./_utility/DirectoryInfo";
import { JsonMap } from "typescript-dotnet-commonjs/JSON";
import { DefinesNode } from "./DefinesNode";
import { IMap } from "typescript-dotnet-commonjs/IMap";
import { ClassesNode, ClassMember } from "./ClassesNode";
import { repeat } from "typescript-dotnet-commonjs/System/Text/Utility";

abstract class DefinesEntityBase {
	constructor(public name: string) {
	}

	abstract toTypeScript(indent?: number): string;
}

class DefinesEnum extends DefinesEntityBase {
	constructor(name: string, public values: string[]) {
		super(name);
	}

	toTypeScript(indent: number = 0): string {
		const i = repeat('\t', indent);
		return i + `export enum ${this.name}\n`
			+ i + `{\n`
			+ this.values.map(k => i + `\t${k}`).join(',\n') + '\n'
			+ i + `}`;
	}
}

class DefinesNamespace extends DefinesEntityBase {
	constructor(name: string) {
		super(name);
	}

	namespaces: DefinesNamespace[] = [];
	enums: DefinesEnum[] = [];

	toTypeScript(indent: number = 0): string {
		const i = repeat('\t', indent);
		let result = i + `export namespace ${this.name}\n`
			+ i + `{\n`;

		if (this.namespaces.length)
			result += this.namespaces
				.map(n => n.toTypeScript(indent + 1)).join('\n\n') + '\n';
		if (this.enums.length)
			result += this.enums
				.map(n => n.toTypeScript(indent + 1)).join('\n\n') + '\n';

		result += i + `}\n`;
		return result;
	}
}

function generateDefineTypes(name: string, node: JsonMap | IMap<DefinesNode>): DefinesNamespace {

	const ns = new DefinesNamespace(name);

	for (const m of Object.keys(node)) {
		const n: DefinesNode = <any>node[m];
		const children: IMap<DefinesNode> = n.properties;
		const e = Object.keys(children)
			.filter(k => children[k].name);


		if (e.length == 0) {
			ns.namespaces.push(generateDefineTypes(m, n.properties));
		}

		else {
			ns.enums.push(new DefinesEnum(m, e));
		}

	}
	return ns;

}

async function generateClassesTypes(dir: DirectoryInfo, node: JsonMap | IMap<ClassesNode>) {
	if (!dir.exists) await dir.create();
	else dir.clear();

	for (const m of Object.keys(node)) {
		const n: ClassesNode = <any>node[m];
		const children: IMap<ClassMember> = n.properties;

		const members: string[] = [];
		const template: string[] = [];

		for (const c in children) {
			let { type, name, doc } = children[c];

			if (doc) {
				members.push(`/**`);
				members.push(` ${doc.split('\n').join('\n\t ')}`);
				members.push(` **/`)
			}

			if (!type) continue;


			if (type == 'function') {
				members.push(`${name}();`);
				members.push(``);
			}
			else {

				const types = type.split(" or ");
				for (let i = 0; i < types.length; i++) {
					let t = types[i];
					const isDictionary = t.indexOf("dictionary ") == 0;
					let key: string;
					if (isDictionary) {
						const arrow = t.indexOf('→');
						key = t.substring(11, arrow - 1);
						t = t.substring(arrow + 2);
					}

					const isArray = t.indexOf("array of ") == 0;
					if (isArray) {
						t = t.substring(9);
					}

					switch (t) {
						case 'float':
						case 'double':
						case 'int':
						case 'uint':
							t = `/* ${t} */ number`;
							break;
					}

					if (t.indexOf('defines.') == 0) {
						const imp = `import {defines} from '../defines';`;
						if (template.indexOf(imp) == -1) template.push(imp)
					}

					if (t != m && t.indexOf('Lua') == 0) {
						const imp = `import ${t} from './${t}';`;
						if (template.indexOf(imp) == -1) template.push(imp);
					}

					if (isArray) t += "[]";
					if (isDictionary) t = `Map<${key}, ${t}>`;
					types[i] = t;

					type = types.join(' | ');
				}


				members.push(`${name}: ${type};\n`);
			}
		}

		template.sort();
		template.push(``);
		if (n.doc) template.push(`/** ${n.doc} **/`);
		template.push(`declare class ${m}`);
		template.push(`{`);
		template.push(`\t` + members.join('\n\t'));
		template.push(`}\n`);
		template.push(`export default ${m};`);

		await dir
			.file(`${m}.d.ts`)
			.write(template.join('\n'));
	}
}

export async function run() {


	const defines = generateDefineTypes("defines",
		await json.read<JsonMap>("./definition/defines.json"));

	const typesDir = new DirectoryInfo("./types");
	if (!typesDir.exists) typesDir.create();
	typesDir.file("defines.d.ts").write(defines.toTypeScript());

	await generateClassesTypes(
		typesDir.directory("classes"),
		await json.read<JsonMap>("./definition/classes.json"));
}