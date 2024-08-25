import { compileCircuit } from '../circuit/compile.ts';
import { Noir } from '@noir-lang/noir_js';

export default async function hashPersonalizado(photoAsFieldElements, width, height){
  // Creamos el circuito
  let noirSourceCodeToComputeHash = circuitToComputeHash(height, width);
  const compiledCircuit = await compileCircuit(noirSourceCodeToComputeHash);
  const noir = new Noir(compiledCircuit);
  await noir.init()
  let result = await noir.execute({ img: photoAsFieldElements })
  //console.log(result)
  return result.returnValue
}

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