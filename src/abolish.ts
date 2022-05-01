import { Abolish, ParseRules } from "abolish";
import { skipIfNotDefined } from "abolish/src/helpers";

const abolish = new Abolish();
abolish.useStartCaseInErrors(false);

export const createFolderRule = ParseRules({
    name: "required|typeof:string",
    project: "required|typeof:string",
    folder: skipIfNotDefined("typeof:string")
});

export default abolish;
