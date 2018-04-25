import {IMap} from "typescript-dotnet-commonjs/IMap";

export interface NodeBase
{
	name: string;
	type: string;
	doc?: string;
}

export interface ClassMember extends NodeBase
{

}

export interface Property extends NodeBase
{
	mode: '[R]' | '[RW]';
}

export interface MethodArg extends NodeBase
{

}

export interface ClassMethod extends ClassMember
{
	args?: IMap<MethodArg>;
	returns?: string;
}

export interface ClassesNode extends NodeBase
{
	inherits?: string[];
	properties: IMap<ClassMember>;
}
