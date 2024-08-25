export default function generateNoirSourceCodeForVerification(orig_rows, orig_cols, cropped_rows, cropped_cols, offset_rows, offset_cols) {
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