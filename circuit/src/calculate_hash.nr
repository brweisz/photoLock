use std::hash::poseidon2;

fn main(img: [Field; 80]) -> Field {
  let sum_of_row: [Field; 8] = [
    img[0] + img[1] + img[2] + img[3] + img[4] + img[5] + img[6] + img[7] + img[8] + img[9],
    img[10] + img[11] + img[12] + img[13] + img[14] + img[15] + img[16] + img[17] + img[18] + img[19],
    img[20] + img[21] + img[22] + img[23] + img[24] + img[25] + img[26] + img[27] + img[28] + img[29],
    img[30] + img[31] + img[32] + img[33] + img[34] + img[35] + img[36] + img[37] + img[38] + img[39],
    img[40] + img[41] + img[42] + img[43] + img[44] + img[45] + img[46] + img[47] + img[48] + img[49],
    img[50] + img[51] + img[52] + img[53] + img[54] + img[55] + img[56] + img[57] + img[58] + img[59],
    img[60] + img[61] + img[62] + img[63] + img[64] + img[65] + img[66] + img[67] + img[68] + img[69],
    img[70] + img[71] + img[72] + img[73] + img[74] + img[75] + img[76] + img[77] + img[78] + img[79],
  ];
  poseidon2::Poseidon2::hash(sum_of_row, sum_of_row.len())
}