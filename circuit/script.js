import fs from 'fs';

// DEFAULT VALUES
const ORIG_ROWS = 8;
const ORIG_COLS = 50;
const CROPPED_ROWS = 3;
const CROPPED_COLS = 4;
const OFFSET_ROWS = 1;
const OFFSET_COLS = 5;

const circuitToComputeHash = (rows, cols) => {
  let noirCodeString = `use std::hash::poseidon2;\n
fn main(img: [Field; ${rows * cols}]) -> pub Field {
  let sum_of_row: [Field; ${rows}] = [`;
  for (let i = 0; i < rows; i++) {
    let rowString = `\n    `;
    for (let j = 0; j < cols; j++) {
      rowString += `img[${i*cols + j}] + `;
    }
    rowString = rowString.slice(0, -3);
    noirCodeString += rowString + `,`;
  }
  noirCodeString.slice(0, -2);

  noirCodeString += `\n  ];\n  poseidon2::Poseidon2::hash(sum_of_row, sum_of_row.len())\n}`;
  return noirCodeString;
}

/*
  This function should be able to create the noir circuit plaintext from the parameters and save it in a file (or return it)
*/
const convertToNoir = (orig_rows, orig_cols, cropped_rows, cropped_cols, offset_rows, offset_cols) => {
  let noirCodeString = `use std::hash::poseidon2;\n
fn main(original: [Field; ${orig_rows * orig_cols}],
        cropped: [Field; ${cropped_rows * cropped_cols}],
        hash: Field) {
  // verify hash
  // first sum the values of each row
  let sum_of_row: [Field; ${orig_rows}] = [`;
  for (let i = 0; i < orig_rows; i++) {
    let rowString = `\n    `;
    for (let j = 0; j < orig_cols; j++) {
      rowString += `original[${i*orig_cols + j}] + `;
    }
    rowString = rowString.slice(0, -3);
    noirCodeString += rowString + `,`;
  }
  noirCodeString.slice(0, -2);

  noirCodeString += `\n  ];\n
  // hash the array using poseidon hash
  let calculated_hash: Field = poseidon2::Poseidon2::hash(sum_of_row, sum_of_row.len());
  assert(hash == calculated_hash);
  \n  // verify cropped image is crop from original`;
  for (let i = 0; i < cropped_rows; i++) {
    for (let j = 0; j < cropped_cols; j++) {
      noirCodeString += `\n  assert(cropped[${i*cropped_cols + j}] == original[${(i + offset_rows)*orig_cols + (j + offset_cols)}]);`;
    }
  }
  noirCodeString += "\n}";
  return noirCodeString;
}

const debugPath = "./src/calculate_hash.nr";
const debugNoir = circuitToComputeHash(ORIG_ROWS, ORIG_COLS);

fs.writeFile(debugPath, debugNoir, (err) => {
  if (err)
    console.error('Error writing file:', err);
  else
    console.log(`Noir code has been written to ${debugPath}`);
});

const mainPath = "./src/main.nr";
const mainNoir = convertToNoir(ORIG_ROWS, ORIG_COLS, CROPPED_ROWS, CROPPED_COLS, OFFSET_ROWS, OFFSET_COLS);

fs.writeFile(mainPath, mainNoir, (err) => {
  if (err)
    console.error('Error writing file:', err);
  else
    console.log(`Noir code has been written to ${mainPath}`);
});
