/* Sets the PDF Title metadata on the resume — the browser tab shows this
   when viewing the PDF, so it should match the public filename, not the
   export-time draft name. Re-run whenever a new resume PDF lands.

   Usage: node scripts/set-pdf-title.mjs [path] [title]
   Defaults: public/ryanjrusson_resume.pdf, "ryanjrusson_resume" */

import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const path = process.argv[2] ?? 'public/ryanjrusson_resume.pdf';
const title = process.argv[3] ?? 'ryanjrusson_resume';

const pdf = await PDFDocument.load(readFileSync(path), { updateMetadata: false });
pdf.setTitle(title);
writeFileSync(path, await pdf.save());
console.log(`Title of ${path} set to "${title}"`);
