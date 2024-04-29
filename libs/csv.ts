import * as fs from 'fs';
import {UpdateWorkers} from "./pm2Function";

const splitSizeInMB = process.env.SPLITSIZEINMB;
const PATH = process.env.INPUTFILE;

let FILTER = [];
let QUEUED_WORK = [];

function csv_to_table(csv) {
    let lines = csv.split("\n");
    let table = [];

    for (let i = 0; i < lines.length; ++i) {
        table.push(lines[i].split(','));
    }

    return table;
}

export const SplitCSV = async (queuedWork : Array<any>, filters : Array<any>) => {
    QUEUED_WORK = queuedWork;
    FILTER = filters;
    // @ts-ignore
    const chunkSize = 1024 * 1024 * splitSizeInMB;
    const chunkBuffer = Buffer.alloc(chunkSize);

    let bytesRead = 0;
    let offset = 0;
    let csvId = 0;

    const fp = fs.openSync(PATH, 'r');

    while (bytesRead = fs.readSync(fp, chunkBuffer, 0, chunkSize, offset)) {

        let streamEnd = FindLastCharacter("\n", chunkBuffer, bytesRead);
        let streamStart = 0; // Will be used to skip header

        if (streamEnd < 0) {
            throw "The buffer is too small or the file isn't an CSV.";
        } else {
            offset += streamEnd + 1;
        }

        // For the first pass, read the header & assign the filter
        if (FILTER.length === 0) {
            streamStart = FindFirstCharacter("\n", chunkBuffer, bytesRead);
            FILTER = FilterHeaders(chunkBuffer.slice(0, streamStart++).toString());
        }

        await SaveCSV(chunkBuffer, streamStart, streamEnd, `${process.env.OUTPUTDIR}CSV-${csvId++}.csv`);

        //if (csvId > 20) break; // FOR DEBUGGING
    }

    console.log("Finished splitting CSV into " + csvId + " files.");
    return {queuedWork: QUEUED_WORK, filters: FILTER};
}

function FilterHeaders(header) {
    let csv = csv_to_table(header);
    let res = [];

    if (csv.length !== 1) throw "Header doesn't exist.";

    let table_header = csv[0];

    const headers = [
        "siren",
        "nic",
        "siret",
        "dateCreationEtablissement",
        "dateDernierTraitementEtablissement",
        "typeVoieEtablissement",
        "libelleVoieEtablissement",
        "codePostalEtablissement",
        "libelleCommuneEtablissement",
        "codeCommuneEtablissement",
        "dateDebut",
        "etatAdministratifEtablissement"
    ];

    for (let i = 0; i < headers.length; ++i) {
        let idx = table_header.find(element => element.indexOf(headers[i]) > -1)
        if (idx === undefined) throw "Header not found: " + headers[i];
        res.push(idx);
    }

    return res;
}

async function SaveCSV(buffer, start, end, savePath) {
    if (!fs.existsSync(process.env.OUTPUTDIR)) fs.mkdirSync(process.env.OUTPUTDIR);
    fs.writeFileSync(savePath, buffer.slice(start, end));
    QUEUED_WORK.push(savePath);
    UpdateWorkers(null, QUEUED_WORK, FILTER);
}

function FindFirstCharacter(character, buffer, bufferSize) {
    for (let i = 0; i < bufferSize; ++i) {
        if (String.fromCharCode(buffer[i]) === character) {
            return i;
        }
    }
    return -1;
}

function FindLastCharacter(character, buffer, bufferSize) {
    for (let i = bufferSize - 1; i >= 0; --i) {
        if (String.fromCharCode(buffer[i]) === character) {
            return i;
        }
    }
    return -1;
}