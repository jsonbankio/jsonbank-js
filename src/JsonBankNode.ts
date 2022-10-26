import JsonBank from "./JsonBank";
import fs from "fs";
import path from "path";

class JsonBankNode extends JsonBank {
    /**
     * Upload Document from file system
     * @param document
     */
    uploadDocument(document: {
        file: string;
        project: string;
        name?: string;
        folder?: string;
    }) {
        // check if file exists
        if (!fs.existsSync(document.file)) {
            throw new Error(`File does not exist: ${document.file}`);
        }

        // Set name to file name if none is defined
        if (!document.name) {
            document.name = path.basename(document.file);
        }

        try {
            return this.createDocument({
                name: document.name,
                project: document.project,
                // Read file.
                content: fs.readFileSync(document.file, "utf8"),
                folder: document.folder
            });
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }
}

export default JsonBankNode;
