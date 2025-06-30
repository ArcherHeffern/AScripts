import { generateSpec } from "har-to-openapi";
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

function prompt_yn(prompt) {
    while (true) {
        console.log(prompt)
        const response = readFileSync(0).toString().trim().toLowerCase();
        if (response == "y" || response == "yes") {
            return true;
        }
        if (response == "n" || response == "no") {
            return false;
        }
    }
}

function main() {
    const har_files = new Set();

    process.argv.forEach(function (path) {
        if (!path.endsWith(".har")) {
            console.error(`'${path}' is not a har file. Skipping...`)
            return;
        }

        const dest_path = path + ".yaml";

        if (!existsSync(path)) {
            console.error(`'${path}' does not exist. Skipping...`)
        }

        if (existsSync(dest_path)) {
            if (!prompt_yn(`Destination '${dest_path}' exist. Continue? (y/n) `)) {
                console.log("Continuing...");
                return;
            }
        }

        har_files.add(path);
    });

    har_files.forEach(async (path) => {
        const har_string = readFileSync(path).toString();
        const har = JSON.parse(har_string);
        const openapi = await generateSpec(har, { relaxedMethods: true });
        const { yamlSpec } = openapi;
        writeFileSync(HAR_INPUT + ".yaml", yamlSpec);
    })
}

main();