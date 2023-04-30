// si on a donne un nom sur la cli c'est une fichier lisible que l'on traite
let lastArg = process.argv[process.argv.length-1]
let fileName = (lastArg == '-' ? "data" : lastArg)
console.log(fileName)
calledInBrowser = false
let tapisGlobal = getFromFile(fileName)
let verbose  = 0
let a = solve(verbose)
console.log(a)
