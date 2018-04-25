import {json} from "./_utility/file-promise";
import DirectoryInfo from "./_utility/DirectoryInfo";
import {JsonMap} from "typescript-dotnet-commonjs/JSON";
import {DefinesNode} from "./DefinesNode";
import {IMap} from "typescript-dotnet-commonjs/IMap";

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

export async function start() {

	const typesDir = new DirectoryInfo("./types");
	const definesDir = typesDir.directory("defines");
	if (definesDir.exists) await definesDir.remove(true);

	if (typesDir.exists) await typesDir.clear();
	else await typesDir.create();

	const defines = await json.read<JsonMap>("./definition/defines.json");

	await generateDefineTypes(definesDir, defines);

}