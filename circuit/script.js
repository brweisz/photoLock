import fs from 'fs';

// DEFAULT VALUES
const ORIG_ROWS = 8;
const ORIG_COLS = 10;
const CROPPED_ROWS = 3;
const CROPPED_COLS = 4;
const OFFSET_ROWS = 1;
const OFFSET_COLS = 5;


/*
  This function should be able to create the noir circuit plaintext from the parameters and save it in a file (or return it)
*/
const convertToNoir = (orig_rows, orig_cols, cropped_rows, cropped_cols, offset_rows, offset_cols) => {
  let noirCodeString = `
use std::hash::poseidon2;\n
fn main(original: [Field; ${orig_rows * orig_cols}],
        cropped: [Field; ${cropped_rows * cropped_cols}],
        hash: Field) {
  // verify hash
  // first sum the values of each row
  let mut sum_of_row: [Field; ${orig_rows}];`;
  for (let i = 0; i < orig_rows; i++) {
    noirCodeString += `\n  sum_of_row[${i}] = `;
    for (let j = 0; j < orig_cols; j++) {
      noirCodeString += `original[${i*orig_cols + j}] + `;
    }
    noirCodeString = noirCodeString.slice(0, -3);
    noirCodeString += `;`;
  }

  noirCodeString += `\n
  // hash the array using poseidon hash"
  let hash: Field = poseidon2::Poseidon2::hash(sum_of_row, sum_of_row.len());
  \n  // verify cropped image is crop from original`;
  for (let i = 0; i < cropped_rows; i++) {
    for (let j = 0; j < cropped_cols; j++) {
      noirCodeString += `\n  assert(cropped[${i*cropped_cols + j}] == original[${(i + offset_rows)*orig_cols + (j + offset_cols)}]);`;
    }
  }
  noirCodeString += "\n}";
  return noirCodeString;
}

const outputPath = "./main.nr";
const noirText = convertToNoir(ORIG_ROWS, ORIG_COLS, CROPPED_ROWS, CROPPED_COLS, OFFSET_ROWS, OFFSET_COLS);

fs.writeFile(outputPath, noirText, (err) => {
  if (err)
    console.error('Error writing file:', err);
  else
    console.log(`Noir code has been written to ${outputPath}`);
});
