// progremme appelant

let myTapis =getFromFile()
let verif = check(myTapis)
console.log("from outside "+verif)
process.exit(1)    


let myRnd = new RandomSeeded()
// console.log(process.argv.length)
// myRnd.seed(51154)
let calledInBrowser = false
var tapisGlobal = new Array(5*(20+1+20));
var verbose = 0
poseLesCartesNonGraphique()
b1 = "58_183_188_66_148_144_62_65_145_141_63_146_185_61_61_61_61_61_61_147_17_18_97_107_140_187_184_184_184_142_60_19_100_64_105_98_103_179_101_102_104_186_180_189_106_182_139_99_57_181_16_59" // on avait pas gagne mais on aurait du
b2 = "61_58_56_57_100_19_59_60_99_18_16_17_15_102_25_24_23_22_21_62_103_63_104_64_65_66_184_187_188_181_179_180_185_144_105_106_107_139_138_143_142_186_183_101_141_140_182_146_147_145_98_97" // donne une mostache sans gagner
choix(b1) // affecte b 
if (verbose>1)
    asciiOut()
let a = solve(verbose)
console.log(a)
