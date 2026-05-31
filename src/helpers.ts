import { JSB_Body } from "./types";


/**
 * Make  path from document object
 * @param document
 */
export function jsb_makeDocumentPath(
    document: Pick<JSB_Body.CreateDocument, "name" | "folder" | "project">
) {
    const folder =
        document.folder && document.folder.length ? document.folder + "/" : "";
    return `${document.project}/${folder}${document.name}`;
}

/**
 * Make path from folder object
 */
export function jsb_makeFolderPath(
    folder: Pick<JSB_Body.CreateFolder, "name" | "folder" | "project">
) {
    const parentFolder =
        folder.folder && folder.folder.length ? folder.folder + "/" : "";
    return `${folder.project}/${parentFolder}${folder.name}`;
}
