use std::hash::poseidon2;

fn main(img: [Field; 80]) {
  let sum_of_row: [Field; 8] = [
    original[0] + original[1] + original[2] + original[3] + original[4] + original[5] + original[6] + original[7] + original[8] + original[9],
    original[10] + original[11] + original[12] + original[13] + original[14] + original[15] + original[16] + original[17] + original[18] + original[19],
    original[20] + original[21] + original[22] + original[23] + original[24] + original[25] + original[26] + original[27] + original[28] + original[29],
    original[30] + original[31] + original[32] + original[33] + original[34] + original[35] + original[36] + original[37] + original[38] + original[39],
    original[40] + original[41] + original[42] + original[43] + original[44] + original[45] + original[46] + original[47] + original[48] + original[49],
    original[50] + original[51] + original[52] + original[53] + original[54] + original[55] + original[56] + original[57] + original[58] + original[59],
    original[60] + original[61] + original[62] + original[63] + original[64] + original[65] + original[66] + original[67] + original[68] + original[69],
    original[70] + original[71] + original[72] + original[73] + original[74] + original[75] + original[76] + original[77] + original[78] + original[79],
  ];
  poseidon2::Poseidon2::hash(sum_of_row, sum_of_row.len())
}