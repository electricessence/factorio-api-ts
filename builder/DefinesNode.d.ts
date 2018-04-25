import {IMap} from "typescript-dotnet-commonjs/IMap";

export interface DefinesNode
{
	name?:string;
	type:'define';
	properties?:IMap<DefinesNode>;
}