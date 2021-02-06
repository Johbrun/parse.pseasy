import { fromDateFormated } from "./helpers";
import { SheetCreation } from "./types";

import * as fs from 'fs';

console.log('*** Launch markdown analysis... ***');

// 3 modes : PARSE (arg) / ANALYSIS (always) / UPDATE (arg)
const PARSE_MODE = false;
const UPDATE_MODE = false;
const startDate = new Date();
let nbErr = 0;
let nbErrSheet = 0;

let sheets: any[] = []
let data: SheetCreation;

if (PARSE_MODE) {

    const mdBuffer = fs.readFileSync('./docs/md/2019-raw-pandoc.md').toString() as string;

    // Step 1 : Split all sheets
    sheets = mdBuffer.split('Référence :')
    sheets.splice(0, 1) // remove first, it's not a sheet
    sheets.pop(); // remove last, not a sheet

    for (let i = 0; i < sheets.length; i++) {
        let sheet = sheets[i];

        // Step 4 : Remove / reformat / clean
        sheet = sheet.replace(/> /g, '');
        sheet = sheet.replace(/(^|\s)o\s/g, '\t- '); // replace puces errors 

        // Step 5 : extract and create sheet
        const a = [...sheet.matchAll(/<p>(.*?)<\/p>/g)];

        data = {
            reference: a[0][1].replace(/ /g, ''),
            version: a[2][1],
            updatedDate: fromDateFormated(a[4][1]),
            title: '',
            content: '',
        }

        // Step 4.1 Remove tables
        sheet = sheet.replace(/<\/p>((.|\s\n)*?)<\/table>/, '');
        // sheet = sheet.replace(/<table>((.|\s\n)*?)<p>/, '');
        sheet = sheet.replace(/<table><tbody><tr class="odd"><td><blockquote><p>/, '');
        sheet = sheet.replace(/\`\`\`(.*)\`\`\`/g, '')
        // sheet = sheet.replace(/```{=html}\s\n<!-- -->\s\n```/g, '')

        const path = `./docs/sheets/${data.reference}.md`;

        // End : write file to test
        if (PARSE_MODE) {
            sheet = JSON.stringify(data) + '\n' + sheet;
            fs.writeFileSync(path, sheet/*, (e) => e ? console.error(e.toString()) : undefined*/)
        }
    }
}


const sheetsPath = fs.readdirSync('./docs/sheets/');
// const sheetsPath = ['AC01G01.md']; // tests

console.log(`[Step 1] - Sheet : ${sheets.length} sheets founds`);

for (let j = 0; j < sheetsPath.length; j++) {
    const sheet = fs.readFileSync(`./docs/sheets/${sheetsPath[j]}`).toString() as string;
    data = JSON.parse(sheet.match(/({.*})/)![0]);

    // now loop on each sheets
    let i = 0;
    let error = false;

    // Step 2 : Detect errors which needed human correction

    // 2. double title
    const doubleTitle = sheet.match(/## [A-Z](.*)[a-z]\s[A-Z][a-z](.*)/g);
    if (doubleTitle) {
        console.warn("[" + data.reference + "][CHECK] DOUBLE_TITLE      : " + doubleTitle[0])
        error = true;;
    }

    // 3. too long titles
    const toLongTitle = sheet.match(/<\/table>\s\n\s\n[A-Z](.*)/g);
    if (toLongTitle) {
        console.warn("[" + data.reference + "][CHECK] INCORRECT_TITLE    : " + toLongTitle[0].substring(0, 100).replace(/\s\n/g, ' '))
        error = true;
        nbErr++;
    }

    // X. Detect tables
    const table = sheet.match(/<table>/g);
    if (table) {
        console.warn("[" + data.reference + "][CHECK] TABLE    : " + table[0].substring(0, 100).replace(/\s\n/g, ' '))
        error = true;
        nbErr++;
    }



    // 4. html tag in content 
    const htmlTag = sheet.match(/<[a-z]>/g);
    if (htmlTag) {
        console.warn("[" + data.reference + "][CHECK] HTML_TAG    : " + htmlTag[0].substring(0, 100).replace(/\s\n/g, ' '))
        error = true;
        nbErr += htmlTag.length
    }

    // 1. first line alone
    // const firstLineAlone = sheet.match(/^# (.*)\s\n\s\n(<|[a-zA-Z]|-)/gm);
    // if (firstLineAlone) {
    //     console.warn("[" + data.reference + "][CHECK] FIRST_LINE_ALONE    : " + firstLineAlone[0].substring(0, 100).replace(/\s\n/g, ' '))
    //     error = true;
    // }

    // check 2 parts : 
    // - string not begin with # or - and finish without ponctuation
    // - string begin with lower case
    const aloneLine = [...sheet.matchAll(/(^(?!#)(?!-)(.*)[a-z]$)|(^[a-z](.*)$)/gm)];
    if (aloneLine.length) {
        console.warn("[" + data.reference + "][CHECK] ALONE_LINE    : " + aloneLine.length); //[0].substring(0, 100).replace(/\s\n/g, ' '));
        error = true;
        nbErr += aloneLine.length
    }

    const puces = [...sheet.matchAll(/```{=html}\s\n<!-- -->\s\n```/g)];
    if (puces.length) {
        console.warn("[" + data.reference + "][CHECK] PUCES    : " + puces.length); //[0].substring(0, 100).replace(/\s\n/g, ' '));
        error = true;
        nbErr += puces.length
    }
    // /```{=html}\s\n<!-- -->\s\n```/g
    if (error) { nbErrSheet++; console.log('**') }

}

console.log(`End script ! ${nbErrSheet} sheet(s) with error, with a total of ${nbErr} error(s)`)