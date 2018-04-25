import {IMap} from "typescript-dotnet-commonjs/IMap";

export interface DefinesNode
{
	type:'define';
	properties:IMap<DefinesNode>;
	name:string;
}