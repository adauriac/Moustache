
var tapisGlobal = new Array(5*(20+1+20)); // 5 lignes et 20 cases a gauche 1 case cenenCtrale et 20 cases a droite
let calledInBrowser = false
let myRnd = new RandomSeeded()
let verbose  = 0
let bidon = 1  // pour inhiber la sortie de la solution
let oui = 0
let non = 0
for (let i=0;i<1000;i++) {
    poseLesCartesNonGraphique();
    let a = solve(-1)
    if (a.indexOf("gagnable")!= -1) {
	oui += 1
	console.log("OK i= "+i)
    }
    else {
	non += 1
	console.log("NO i= "+i)
    }
}
console.log("oui= "+oui)
console.log("non= "+non)
