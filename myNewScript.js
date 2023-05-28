// Ce script est appele
//   soit lors du chargement de la page dragNew.html
//   soit en cli node

// en mode cli il resoud une postion au hasard ou une postion donnee sur la cli
//      arguments:  verbose=%d
//                  d=61_148_181_21_..._
// en mode web il repond aux boutons et interagit via document.getBy...

// Le tapis est un tableau de taille 5 lignes et 20+1+20 colonnes, linearise 
// comme unidimensionnel 5*(20+1+20) qui contient -1 si case vide sinon
// l'entier coul*13+val

// Le deck est un tableau de taille 52 qui contient la postion sur le tapis
// comme l'index de chaque carte sur le tapis: (l,c)-> (20+1+20)*l+(c+20);

// ****************************************************************
//                      PARAMETRES MODIFIABLES
// ****************************************************************
console.log("debut du script");
let verbose = 0; // sur la console
let margeHaut = 100, margeCentre = 20;
let lCarte = 96,cCarte = 75; // les dim sont 75x96
let espaceMonte = 20; // espace entre la colonne ou on monte et ses voisines
let chevauche = 40; // chevauchement des cartes
let bandeauEnHaut = 80; // pour les boutons
let bidon = 0
let cpt = 0;
// ****************************************************************
//                      FIN PARAMETRES MODIFIABLES
// ****************************************************************
// parametre de la tabelette ou ordi
let C,L,elements;
// est-ce que ce script a ete appelle depuis un fichier html
// ou directement depuis la ligne de commande : node script.js
console.log("hy3!")
let calledInBrowser;
if (typeof document === "undefined")
    calledInBrowser = false;
else
    calledInBrowser = true;

if (calledInBrowser) { // relatif a l'interface avec html
    var isTouch = 'ontouchstart' in document.documentElement;
    C = screen.width; // nombre de colonnes de pixels
    L = screen.height; // nombre de lignes de pixels
    var tutoVideo = document.getElementById("tutoVideo"); 
    elements = document.getElementsByClassName("mydiv");
    for (let i = 0; elements[i]; i++)
	makeElementDraggable(elements[i]);
    let helpBtn = document.getElementById("help")
    helpBtn.style.left = C/2-cCarte/2+"px";
    helpBtn.style.top = bandeauEnHaut+"px";
    // ci dessous on affecte une valeur gagnante au champ zoneEntree
    let elt = document.getElementById("zoneEntree")
    if (elt != null)
	elt.value = "184_57_97_56_21_22_187_104_60_144_185_180_183_102_138_64_23_101_182_147_181_25_179_100_140_24_61_139_98_66_186_65_188_99_103_18_16_146_19_143_58_62_142_106_15_141_107_145_17_59_105_63"
}

// declaration
var tapisGlobal = new Array(5*(20+1+20)); // 5 lignes et 20 cases a gauche 1 case cenenCtrale et 20 cases a droite
tapisGlobal.fill(-1); // -1 veut dire pas de carte. ATTENTION en colonne centrake (col=0) il y a une pile de cartes
//Make the DIV element draggagle:

let coup,tour;
let myRnd = new RandomSeeded();  // random Generator
let historique;
let noAlert = false;
let mode="simple";
goMyNewScript();//go(3793366702);


// ************************************************************
//            FUNCTIONS
// ************************************************************

function goMyNewScript(seedSt) {
    // si seedSt==gagnable alors on generera une partie gagnable
    console.log("go(seedSt) de myNewScript.js");
    let gagnable = (seedSt=="gagnable")
    // seedSt="1657205631" un exemple qui marche
    if (!isNaN(parseInt(seedSt)))  // si seedSt est un nombre
	myRnd.seed(parseInt(seedSt));
    else
	myRnd.reSeed();
    seed = myRnd.seedUsed;  // si c'etait -1 ce sera la valeur effectivement utilisee
    historique = [];
    tour = 1;
    coup = 1;
    if (calledInBrowser) {
	document.getElementById("seedId").value = myRnd.seedUsed;
	updateInfo();
    }
    for (;;) {  // pour trouver une partie gagnable si demande
	poseLesCartesNonGraphique(); // sera perdu si une conf special est demandee par argu en cmd line
	if (!gagnable)
	    break;
	let a = solve(-1)
	if (a.indexOf("gagnable")!= -1)
	    break;
    }
    if (calledInBrowser) {
	showAllCardsOnScreen();
    } else {  // appel en script pour resoudre 
	let verbose = 0
	for(let i=2;i<process.argv.length;i++) {
	    let arg = process.argv[i];
	    if (arg.slice(0,8) == "verbose=") {
		verbose = parseInt(arg.slice(8))
		continue
	    } // fin verbose
	    if (arg.slice(0,2) == "d=") {
		// apres d c'est la string qui represente le deck initial
		choix(arg.slice(2))
		continue
	    } // fin d=
	}  // fin traitement des parametres de la ligne de cmd
	if (verbose){
	    console.log(a2s(resume(tapisGlobal)))
	    asciiOut();
	}
	solve(verbose);
    }
    let res = resume(tapisGlobal);
    historique.push(res);
}  // FIN function goMyNewScript(seedSt)
// ************************************************************

function nouveauJeuGagnable() {
    goMyNewScript("gagnable");
}  // FIN function nouveauJeuGagnable()
// ************************************************************

// ************************************************************
//                  NOUVEAUTES POUR SOLVE
// ************************************************************
