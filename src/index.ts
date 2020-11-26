// import { fromDateFormated } from "./helpers";
// import { SheetCreation } from "./types";

import { fromDateFormated } from "./helpers";
import { SheetCreation } from "./types";


//const fs = require('fs');
// const path = require('path');
import * as fs from 'fs';
import * as path from 'path';
import { exit } from "process";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

// const parseSheets = async (body: string, year : string) => 
// {

//     const r1 = body.match(/Référence :/g)!.length;
//     console.log(`Received ${r1} sheets`);

//     // add end for next regex
//     body+= '<table>\n<tbody>\n<tr class="odd">\n<td><blockquote>\n<p>Référence :';

//     // extract sheets
//     const sheets = [...body.matchAll(/<table>.*?(?=<table>\n<tbody>\n<tr class="odd">\n<td><blockquote>\n<p>Référence :)/gmis)]
//         .map(m => m[0]);
//     let nbErr=0;
//     let header;
//     let i = 0;
//     for (let sheet of sheets)
//     {
//         i++;
//         try
//         {
//             sheet = sheet.replace(/ \u00a0+/g, ' ') // delete supp spaces
//                 .trim();
//             const matches = [...sheet.matchAll(/<table>((.|\n)*)?(?=^# )((.|\n)*)/gmi)];

//             header = matches[0][1] ;
//             let content = matches[0][3];

//             let [, reference, , version, , updatedDate] = header.match(/<p>(.*)<\/p>/gmi)!
//                 .map(h => h.replace('<p>', '').replace('</p>', ''));
//             const title = content.match(/^# (.*)/gm);
//             if (!title)
//             {
//                 throw new Error('Sheet with no title');
//             }

//             content = content.replace(title[0], '').replace(/^\n*/, '');

//             const sheetCreation: SheetCreation = {
//                 title : title[0].replace('# ', '').trim(),
//                 content,
//                 reference:reference.replace(/ /gi, ''),
//                 version:version.replace(/N/gi, ''),
//                 updatedDate: fromDateFormated(updatedDate)
//             };
//         }
//         catch(e)
//         {
//             console.error(i,e);
//             nbErr++;
//             let outputFilePath = './debug/' + year + '-' +i + '.md';
//             console.log(`Writing to ${outputFilePath}...`);

//             fs.writeFileSync(path.resolve(outputFilePath), e+'\n\n\n'+sheet);
//         }
//     }

//     console.log({r1, r2 :sheets.length, err : nbErr});
// };

// const parser = async () => 
// {
console.log('*** Launch markdown analysis... ***');
// 3 modes : PARSE (arg) / ANALYSIS (always) / UPDATE (arg)
const PARSE_MODE = true;
const UPDATE_MODE = false;
const startDate = new Date();
let nbSheet = 0;
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
        if (data.reference.toLocaleLowerCase() === 'ft01r01') {
            console.log(sheet)
        }
        // Step 4.1 Remove tables
        sheet = sheet.replace(/<\/p>((.|\s\n)*?)<\/table>/, '');
        // sheet = sheet.replace(/<table>((.|\s\n)*?)<p>/, '');
        sheet = sheet.replace(/<table><tbody><tr class="odd"><td><blockquote><p>/, '');
        sheet = sheet.replace(/\`\`\`(.*)\`\`\`/g, '')
        // sheet = sheet.replace(/```{=html}\s\n<!-- -->\s\n```/g, '')

        // const path = `./docs/sheets/${error ? '_X_' : ''} ${data.reference}.md`;
        const path = `./docs/sheets/${data.reference}.md`;
        // End : write file to test
        if (PARSE_MODE) {
            sheet = JSON.stringify(data) + '\n' + sheet;
            fs.writeFileSync(path, sheet/*, (e) => e ? console.error(e.toString()) : undefined*/)
        }
    }
}


const sheetsPath = fs.readdirSync('./docs/sheets/');
// const sheetsPath = ['FT07I05.md'];
console.log(`[Step 1] - Sheet : ${sheets.length} sheets founds`);

console.log("sheets loaded")

for (let j = 0; j < sheetsPath.length; j++) {
    const sheet = fs.readFileSync(`./docs/sheets/${sheetsPath[j]}`).toString() as string;
    data = JSON.parse(sheet.match(/({.*})/)![0]);
    // console.log(data);
    // console.log(sheet.length)
    // now loop on each sheets
    let i = 0;
    let error = false;



    // Step 2 : Detect errors which needed human correction
    error = false;

    // 1. first line alone
    // const firstLineAlone = sheet.match(/# (.)*\n\n[A-Z]/g);
    // if (firstLineAlone) {
    //     console.error("[" + data.reference + "][ERROR] FIRST_LINE_ALONE  : " + firstLineAlone[0])
    //     error = true;
    // }

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

    const table = sheet.match(/<table>/g);
    if (table) {
        console.warn("[" + data.reference + "][CHECK] TABLE    : " + table[0].substring(0, 100).replace(/\s\n/g, ' '))
        error = true;
        nbErr++;
    }

    // X. Detect tabs

    // 4. html tag in content 
    // const htmlTag = sheet.match(/<[a-z]>/g);
    // if (htmlTag) {
    //     console.warn("[" + data.reference + "][CHECK] HTML_TAG    : " + htmlTag[0].substring(0, 100).replace(/\s\n/g, ' '))
    //     error = true;
    // }

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
    /```{=html}\s\n<!-- -->\s\n```/g
    if (error) { nbErrSheet++; console.log('**') }

}

console.log("********* END SCRIPT ", nbErrSheet, nbErr)

// LIRE TOUS LES FICHIERS ET RECUPERER REFERENCE PAR NOM DE FICHEIR
// PUIS TOUT RETESTER



    // const matchs = [...mdBuffer.matchAll(/^(#{4}\s[A-Z](.|\n)*?(?=[A-Z]|#{5}))((.|\n)*?(?=^####\s))/gm)];
//     const f = () => {
//     let i = 1;
//   //  pdf2md(mdBuffer, undefined)
//         .then(async (text: string) => 
//         {
//             const matchs = [...text.matchAll(/^(#{4}\s[A-Z](.|\n)*?(?=[A-Z]|#{5}))((.|\n)*?(?=^####\s))/gm)];
//             console.log(`PDF parsed with success. ${matchs ? matchs.length : '0'} regex matchs founds`);

//             // regroup titles on several lines
//             // matchs.forEach(m => {
//             for (const m of matchs) 
//             {
//                 nbSheet++;
//                 const title = m[1]
//                     .replace(/[#\n]*/g, '')
//                     .replace(/-$/g, '')
//                     .trim();
//                 try 
//                 {
//                     // regroup titles on several lines
//                     const id = i++;
//                     let refString = m[3] ? m[3].match(/^ Référence.*/gm) : '';
//                     refString = refString ? refString[0] : (refString = '');
//                     let content = m[3]
//                         .replace(/^ Référence.*/gm, '') // Remove ref line
//                         .replace(/[\t]*/g, '') // Delete tabulations
//                         .replace(/###/g, '') // Up titles : be careful : max : h2
//                         .replace(/(.{1})(7)(.{1})/g, '$1ti$3')
//                         .replace(/(.{1})(F)(.{1})/g, '$1tt$3')
//                         .replace(/(#+ [A-z].*)(\n\n#+)( [a-z])/g, '$1$3') // uncut titles
//                         .replace(/\^/g, '')
//                         .replace(/ \u00a0+/g, ' ') // delete supp spaces
//                         .trim();

//                     const refM = [
//                         ...refString.matchAll(/^\s*Référence\s*:\s*(.*)\s*Version\s*:\s*(.*)\s*Mise\s*à\s*jour\s*:\s*(.*)/gm)
//                     ][0];
//                     const reference = refM[1].replace(/[\s\t]*/g, '').trim();
//                     const version = refM[2].trim();
//                     const updatedDate = new Date(); //refM[3].trim();

//                     const sheet: any = {
//                         id: id.toString(),
//                         title,
//                         content,
//                         reference,
//                         version,
//                         updatedDate
//                     };
//                     //await insertSheet(sheet).catch(e => nbErr++);
//                 }
//                 catch (e) 
//                 {
//                     nbErr++;
//                     console.error(`Error on sheet '${title}' (${i}) : ${e}`);
//                 }
//             }
//             // await updateSheetsCategory();

//             // let outputFile = "./file" + i + ".md";
//             // console.log(`Writing to ${outputFile}...`);
//             // fs.writeFileSync(path.resolve(outputFile), text);
//             //  console.log("Done.");
//             //   console.log(text);

//             //   const matchs = [...text.matchAll(/\*\*([0-9].[0-9])\s(.*)\*\*/g)];

//             //   const exp = matchs.map(m => ({
//             //     num: m[1],
//             //     name: m[2].replace("– ", "").toLowerCase()
//             //   }));

//             //   // delete doublons

//             //   // insert in BD
//             //   insertCategories(exp);
//             //   console.log(exp);

//             //       ^#{1}\s((.|\n)*)#
//             // \*\*([0-9].[0-9])\s(.*)\*\*
//             // \n\n((.|\n)*)^####

//             // const sheets = text.split(" Référence	  :");
//             // sheets.shift();
//             // console.log("sheets nb : ", sheets.length);
//             // console.log(sheets.match(/%^#{4}\s([A-Z].*\n\n.*)/gm)]) // ^#{4}\s([A-Z].*\n\n.*)
//             // sheets.forEach(s => console.log(s.match(/^(.*)/g)));
//             // sheets.forEach(s => console.log(s.match(/%^#{4}\s([A-Z].*\n\n.*)/gm)));
//         })
//         .then(() =>
//             console.log(`Process ended in ${(+new Date() - +startDate) / 1000} sec for ${nbSheet} sheets and ${nbErr} errors`)
//         )
//         .catch((err: any) => 
//         {
//             nbErr++;
//             console.error(err);
//         });
//     }
// // };
