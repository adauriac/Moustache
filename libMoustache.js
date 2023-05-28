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

class RandomSeeded {
    // Si la fonction random() est appelee sans que seed() n'ai ete appelee avant
    // alors Math.random() donne le seed. Sinon l'appel a seed(mySeed) donne seed.
    // De toutes facons this.seedUsed contient le seed rellement utilise
    constructor() {
	this.seedUsed = Math.floor(Math.random()*4294967296);
	this.mask = 0xffffffff;
	this.seed(this.seedUsed);
    } // fin constructor(seed) 
    // This set the seed, Takes any integer
    seed(i) {
	this.seedUsed = i;
	this.m_w = (123456789 + i) & this.mask;
	this.m_z = (987654321 - i) & this.mask;
    } // fin seed(i)
    reSeed() {
	// reinitialise au hasard
	this.seedUsed = Math.floor(Math.random()*4294967296);
	this.mask = 0xffffffff;
	this.seed(this.seedUsed);
    }
    // Returns number between 0 (inclusive) and 1 (exclusive) //4294967296
    // just like Math.random().
    random() {
	this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
	this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
	var result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
	return result/4294967296;
    } // fin random()
}  // FIN class RandomSeeded 
// *******************************************************************

function min(x,y){return x<y ? x : y}
function max(x,y){return x>y ? x : y}
function couleur(carte) {return Math.floor(carte/13);} // ce sera 0:d/1:c/2:h/3:s
function valeur(carte) {return carte%13;} // 0:As/1:2/2:3/ ... /9:10/10:valet/11:reine//12:roi
function karte(val,coul) {return coul*13+val;}
function getParameter( parameterName) {
    let parameters = new URLSearchParams( window.location.search );
    return parameters.get( parameterName)
} // FIN function getParameter(parameterName)
// ************************************************************

function playTuto() { 
  tutoVideo.play(); 
}   // FIN function playTuto()
// ************************************************************

function go(tapisDonne) {
    historique = [];
    tour = 1;
    coup = 1;
    if (calledInBrowser) {
	updateInfo();
    }
    if (arguments.length==0)
	poseLesCartesNonGraphique();
    else
	tapisGlobal = s2a(tapisDonne)
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
}  // FIN function go(seedSt)
// ************************************************************

function switchMode() {
    // passage du mode "simple" ou mode "full"
    alert("Beaucoup d'améliorations prévues, incluant une analyse exhaustive de tous les coups possibles, un reservoir de parties intéressantes, etc . Pas encore implementé")
    if (mode=="simple") {
	mode = "full";
    } else {
	mode = "simple";
    }
}  // FIN function switchMode() 
// ************************************************************

function nextTour() {
    if (tour>=3)
	alert("tricheurs !!!");
    reposeLesCartesNonGraphique();
    // asciiOut();
    showAllCardsOnScreen();
    tour ++;
    coup = 1;
    updateInfo();
    historique = [];
    let res = resume(tapisGlobal);
    historique.push(res);
}  // FIN function nextTour()
// ***********************************************************

function annuleDernierCoup(){
    if (historique.length==1) // pour les cretins qui font undo au 1er coup
	return;
    historique.pop();
    let ancien = historique[historique.length-1];
    deResume(ancien) ;
    showAllCardsOnScreen();
    coup--;
    if (coup==0)
	alert("oops coup 0")
    updateInfo();
}  // FIN function annuleDernierCoup()
// ***********************************************************

function reposeLesCartesNonGraphique() {
    const reste = [];
    for(let l=1;l<5;l++) {
	for (let c=-20;c<=20;c++) {
	    if (c==0)
		continue;
	    let i = index(l,c);
	    let k = tapisGlobal[index(l,c)];
	    if (k==-1) // donc pas de carte
		continue;
	    reste.push(k);
	    tapisGlobal[i]= -1;
	}
    }
    shuffle(reste);
    let col = -1;
    let line = 1;
    for (let i=0;i<reste.length;i++) {
	tapisGlobal[index(line,col)] = reste[i];
	line++;
	if (line==5) { 
	    line = 1;
	    if (col<0)
		col = -col;
	    else 
		col = -col-1;
	}
    }
    //asciiOut();
}  // FIN function reposeLesCartesNonGraphique()
// ************************************************************

function fileReading() {
    alert("file Reading()");
}  // FIN function fileReading()
// ************************************************************

function help() {
    // appelee lorque le boton help est clique
    let resteAMonter = 0;// nb carte restant a monter
    for(let l=0;l<5;l++)
	resteAMonter += nbCartesDroite(l) - nbCartesGauche(l);
    if (resteAMonter==0) {
	gagne();
	return;
    }
    // test les matchs, montee, cree le resume et le push dans l'historique
    var carteMatchantes = [];
    for(var l=0;l<5;l++) {
	let nbg = nbCartesGauche(l);
	if (nbg!=0) {
	    let carteBout = tapisGlobal[index(l,nbg)];
	    let aux = matchante(carteBout);
	    carteMatchantes = carteMatchantes.concat(aux);
	}
	let nbd = nbCartesDroite(l);
	if (nbd!=0) {
	    let carteBout = tapisGlobal[index(l,nbd)];
	    let aux = matchante(carteBout);
	    carteMatchantes = carteMatchantes.concat(aux);
	}
    } 
    //console.log("carteMatchantes "+carteMatchantes);
    // cartes montantes
    carteMontantes = [];
    for (let l=1;l<5;l++) 
	if (tapisGlobal[index(l,0)]==-1){
	    // case vide tout as peux monter
	    for(let x=0;x<4;x++)
		carteMontantes.push(13*x);
	} else if (tapisGlobal[index(l,0)] != 12)
	    carteMontantes.push(tapisGlobal[index(l,0)]+1);
    //console.log("carteMontantes "+carteMontantes);
    let zMont = 0;
    let zMatch = 0;
    let matchantes = []
    for(var l=0;l<5;l++) {
     	let nbg = nbCartesGauche(l);
	if (nbg!=0) {
    	    let carteTestee = tapisGlobal[index(l,nbg)];
	    if (countEltInList(carteTestee,carteMatchantes)==1) {
		matchantes.push(enClair(carteTestee));
		zMatch += 1;
	    }
	    zMont += countEltInList(carteTestee,carteMontantes);
     	}
	let nbd = nbCartesDroite(l);
    	if (nbd!=0) {
     	    let carteTestee = tapisGlobal[index(l,nbd)];
	    if (countEltInList(carteTestee,carteMatchantes)==1) {
		matchantes.push(enClair(carteTestee));
		zMatch += 1
	    }
	    zMont += countEltInList(carteTestee,carteMontantes);
     	}
    }
    alert("il reste "+resteAMonter+" cartes a monter. Il y a "+zMatch+" matchs ("+ matchantes +"). "+zMont+" carte(s) qui monte(nt)");
}  // FIN function help()
// ************************************************************

function poseLesCartesNonGraphique() {
    // CONTRUIT LE TABLEAU GLOBAL tapisGlobal EN POSANT
    // LES CARTES AVEC LA REGLE DES AS QUI MONTENT DIRECT
    // SI LA CASE CENTRALE DE CETTE LIGNE EST VIDE.
    // 
    // on va construire une permuation de 0..51
    var P = new Array(52); // la permutation
    for (let i=0;i<52;i++)
	P[i] = i;
    shuffle(P);
    // on reinitilaise
    tapisGlobal.fill(-1);
    let curL = 0;
    let curC = -1;
    for(let i=0;i<52;i++) {
	let j = P[i];
	let val = valeur(j);
	let coul = couleur(j);
	let k;
	if ((val==0) && (curL!=0) ) { // si un as et pas ligne 0 (moustache)
	    k = getInPlaceNonGraphique(curL,0);
	    if (k==-1) { // la colonne du milieu de ctee ligne est vide
		putInPlaceNonGraphique(j,curL,0);
		continue;
	    }
	} // fin if (val==0) && (curL!=0)
	// ici c'est un non as ou un As mais la case du lieu est deja prise
	putInPlaceNonGraphique(j,curL,curC);
	curL++;
	if (curL==5) { // on est a la ligne du bas
	    curL = 0;
	    if (curC<0)
	        curC= -curC;
	    else
		curC = -curC-1;
	}
    } // fin for(int i=0;i<52
}  // FIN function poseLesCartesNonGraphique()
// *******************************************************************

function shuffle(array) {
    // from https://jsavascript.info/task/shuffle
    // utilise l'algo de Fisher-Yates aka Knuth
    // les tests en freq. sont ok
    for (let i = array.length - 1; i > 0; i--) {
	let j = Math.floor(myRnd.random() * (i + 1));
	[array[i], array[j]] = [array[j], array[i]];
    }
}  // FIN function shuffle(array)
// *******************************************************************

function dsQuelleColonneEstCurseur(x) {
    let col=-1;
    if ((C/2-cCarte/2<x) && (x<C/2+cCarte/2))
	return 0;
    if (x>C/2+cCarte/2+espaceMonte) {
	let dx = (x-(C/2+cCarte/2+espaceMonte))
	let largEffCarte = cCarte-chevauche;
	return Math.floor((dx-largEffCarte)/largEffCarte)+2;
    }
    if (x<C/2-cCarte/2-espaceMonte) {
	let dx = (x-(C/2-cCarte/2-espaceMonte));
	dx = -dx;
	let largEffCarte = cCarte-chevauche;
	return -(Math.floor((dx-largEffCarte)/largEffCarte)+2);
    }
    return -1;
}  // FIN function dsQuelleColonneEstCurseur()
// ******************************************************************

function deQuelCoteEstCurseur(x) {
    // retourne -1 pour gauche, 0 pour colonne centrale, 1 pour droit
    let col=-1;
    if ((C/2-cCarte/2-espaceMonte<x) && (x<C/2+cCarte/2+espaceMonte))
	return 0;
    if (x>C/2+cCarte/2+espaceMonte)
	return 1;
    return -1;
}  // FIN function deQuelCoteEstCurseur(x)
// ******************************************************************

function dsQuelleLigneEstCurseur(y) {
    let lin=-1;
    y -= bandeauEnHaut;
    lin = Math.floor((y-lCarte)/lCarte)+1;
    return lin;
}  // FIN function dsQuelleLigneEstCurseur()
// ******************************************************************

function showOneCardOnScreen(carte,ligne,col) {
    // affiche la carte carte en position ligne col
    if ((carte<0) || (carte>=52)){
	alert("oops showOneCardOnScreen: carte invalide "+carte);
    }
    if ((ligne<0) || (ligne>=5) || (col<-20) || (col>20)){
 	alert("oops showOneCardOnScreen: position invalide "+ligne+" "+col);
   }
    // ici la carte et la position sont oks
    let X = C/2-cCarte/2 + col*cCarte;
    if (col<0)
	X -= espaceMonte - chevauche*(-col-1);
    else if (col>0)
	X += espaceMonte - chevauche*(col-1);
    let Y = ligne*lCarte;
    Y += bandeauEnHaut;
    elements[carte].style.left = X+"px"; // c'est la colonne
    elements[carte].style.top = Y+"px"; // c'est la ligne
    let z = (col<0) ? -col : col;
    elements[carte].style.zIndex = z;
}  // FIN function showOneCardOnScreen(carte,ligne,col) 
// *******************************************************************

function showAllCardsOnScreen() {
    // affiche toutes les cartes
    for(let k=0;k<elements.length;k++) {
	elements[k].style.left = "0px";
	elements[k].style.top = "0px";
    }
    for(let l=0;l<5;l++) {
	for (let c=-20;c<=20;c++) {
	    let k = getInPlaceNonGraphique(l,c);
	    if (k==-1) // donc pas de carte
		continue;
	    if (c==0) { // colonne du centre on entasse les cartes !
		let val = valeur(k)
		let coul = couleur(k)
		for(let i=0;i<=val;i++)
		    showOneCardOnScreen(coul*13+i,l,c);
	    } else // pas la colonne du milieu
		showOneCardOnScreen(k,l,c);
	}
    }
}  // FIN function showAllCardsOnScreen() 
// *******************************************************************

function getInPlaceNonGraphique(l,c) { //quoi en l,c
    if ((l<0) || (l>4) || (c<-20) || (c>20)) {
	//alert("oops on demande une carte hors table (get) !");
	return -1;
    }
    return tapisGlobal[index(l,c)];
} // FIN function getInPlaceNonGraphique(l,c) 
// *******************************************************************

function index(l,c) {
    return (20+1+20)*l+(c+20);
}  // FIN function index(l,c)
// *******************************************************************

function unindex(k) {
    // retourne la sting l=%d c=%d
    let l = Math.floor(k/(20+1+20));
    let c = k%(20+1+20) - 20;
    return [l,c];
}  // FIN function unindex(l,c)
// *******************************************************************

function unindexStr(k) {
    // retourne la sting l=%d c=%d
    let l,c;
    [l,c] = unindex(k);
    return ("ligne="+l+" colonne="+c);
}  // FIN function unindex(l,c)
// *******************************************************************

function enClair(carte) {
    // retourne une string representant la carte
    if (carte==-1)
	return "noCard"
    let lesCouls = ["carreau","trefle","coeur","pique"];
    let lesValeurs = ["as","2","3","4","5","6","7","8","9","10","valet","dame","roi"];
    return lesValeurs[valeur(carte)]+" de "+lesCouls[couleur(carte)];
}  //FIN function enClair(carte)
// *******************************************************************

function putInPlaceNonGraphique(k,l,c) { //quoi en l,c
    if ((l<0) || (l>4) || (c<-20) || (c>20)) {
	alert("oops on demande une carte hors table (put) !");
	return -1;
    }
    if ((k<0-1) || (k>51))
	alert("oops on veut placer une carte qui n'existe pas !");
    tapisGlobal[index(l,c)] = k;
} // FIN function putInPlaceNonGraphique(k,l,c)
// *******************************************************************

function cartePosFromMousePos(posX,posY) {
    // retourne [ligne,colonne] a partir de la position (poxX,posY) en pixels
    let marginDelta = (posX > C/2) ? margeCentre : -margeCentre;
    let k = Math.floor((posX - marginDelta - C/2 +cCarte/2)/cCarte);
    let q = Math.floor((posY-margeHaut)/lCarte);
    // document.getElementById("outZone").innerHTML = "Ex="+posInitX+ " C/2="+C/2+" k="+k+" q="+q;
    return [q,k];
}  // FIN function cartePosFromMousePos(posX,posY)
// *******************************************************************

function onPeutPrendre(line,col) {
    // estec que ca carte en ligne col est presente et en bord de rangee ?
    if (getInPlaceNonGraphique(line,col)==-1) 
	return false; // pas presente
    if (col>0)
	return (getInPlaceNonGraphique(line,col+1)==-1) && (getInPlaceNonGraphique(line,col-1)!=-1);
    if (col<0)
	return (getInPlaceNonGraphique(line,col-1)==-1) && (getInPlaceNonGraphique(line,col+1)!=-1);
    return false;

}  // FIN function onPeutPrendre(line,col) 
// *******************************************************************

function nbCartesGauche(line) { // EN REALITE C'EST - DONC UN NBRE NEGATIF
    if ((line<0) || (line>5)) {
	//alert("nbCartesGauche: line="+line);
	return -1;
    }
    // pas de carte return 0
    // une carte return -1
    // deux cartes return -2 etc
    let col = -1;
    while (true) {
	if (getInPlaceNonGraphique(line,col)==-1)
	    break;
	col --;
    }
    return col+1;
}  // FIN function nbCartesGauche(line) 
// *******************************************************************

function nbCartesDroite(line) {
    // pas de carte return 0
    // une carte return 1
    // deux cartes return 2 etc
   if ((line<0) || (line>5)) {
	//alert("nbCartesGauche: line="+line);
	return -1;
    }
    let col = 1;
    while (true) {
	if (getInPlaceNonGraphique(line,col)==-1)
	    break;
	col ++;
    }
    return col-1;
}  // FIN function nbCartesDroite(line) 
// *******************************************************************

function updateInfo() {
    document.getElementById("outZone").innerHTML = "Vous allez jouer le coup "+coup+" du tour "+tour;
}  // FIN function updateInfo()
// *******************************************************************

function makeElementDraggable(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var zInitial, topInitial,leftInitial; // Pour restaurer tapis si movement refuse
    var laLineInitial,laColInitial,indiceInitial,coteInitial; // pour decider si ok
    var carteTraitee;
    /*  move the DIV from anywhere inside the DIV:*/
    elmnt.style.zIndex = -1;
    elmnt.onpointerdown = onMouseDown;

    function onMouseDown(e) {
	console.log("onMouseDown")
      	e = e || window.event;
	if (e.button != 0)
	    return ;
      	e.preventDefault();
      	// get the mouse cursor position at startup:
      	pos3 = e.clientX;
      	pos4 = e.clientY;
	topInitial =elmnt.style.top;
      	leftInitial = elmnt.style.left ;
	zInitial = elmnt.style.zIndex;	
	coteInitial = deQuelCoteEstCurseur(e.pageX);
	laLigneInitial = dsQuelleLigneEstCurseur(e.pageY) ;
	laColInitial = dsQuelleColonneEstCurseur(e.pageX) ;
	let nCarteGauche = nbCartesGauche(laLigneInitial);
	let nCarteDroite = nbCartesDroite(laLigneInitial);
	laColInitial = (laColInitial>0) ? min(laColInitial,nCarteDroite) : max(laColInitial,nCarteGauche);
	indiceInitial = index(laLigneInitial,laColInitial);
	carteTraitee = tapisGlobal[indiceInitial];
	let k = laColInitial<0 ? nbCartesGauche(laLigneInitial): nbCartesDroite(laLigneInitial);
	k = k<0 ? -k : k;
	let id = elmnt.id;
//	console.log("je prend "+id+" carteTraitee="+carteTraitee+" en ("+laLigneInitial+","+laColInitial+") indice="+indiceInitial);
	// a t on le droit de prendre cette carte ?
	if (k==zInitial) {
	    // c'est une carte que l'on peut deplacer car en bout de ligne
	    elmnt.style.zIndex = 100;
     	    document.onpointerup = closeDragElement;
      	    document.onpointermove = elementDrag;
	}
    } // FIN function onMouseDown(e)
    // ********************************************************************
    function nul(){console.log("nul");}
    
    function elementDrag(e) {
	console.log("Enter elementDrag ")
      	document.onpointermove = null; // pour eviter d'etre interrompu dans l'interuption
	
	console.log(e)
      	e = e || window.event; // pour les vieux browser ...
	// if (e.button != 0)
	//     return ;
      	e.preventDefault();
      	// calculate the new cursor position:
      	pos1 = pos3 - e.clientX;
      	pos2 = pos4 - e.clientY;
      	pos3 = e.clientX;
      	pos4 = e.clientY;
      	// set the element's new position:
      	elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      	elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      	document.onpointermove = elementDrag;  // pour repermettre cette interuption
	console.log("Leave elementDrag ")
    } // FIN function elementDrag(e)
    // ********************************************************************

    function closeDragElement(e) {
      	/* stop moving when mouse button is released:*/
 	console.log("closeDragElement")
     	e = e || window.event; // rajoute par JC
      	e.preventDefault(); // rajoute par JC
      	document.onpointerup = nul;  // indispensable
      	document.onpointermove = nul; // indispensable
	let laLigneFinal = dsQuelleLigneEstCurseur(e.pageY) ;
	if ((laLigneFinal<0) || (laLigneFinal>=5)) { //carte hors tapis
	    // on restaure les valeurs au moment du pointerdown corresponadant
	    elmnt.style.top = topInitial;
      	    elmnt.style.left = leftInitial;
	    elmnt.style.zIndex = zInitial;
	    return;
	}
	let coteFinal = deQuelCoteEstCurseur(e.pageX) ; // cote duquel on va tenter de poser
	let caseDest = isOK(coteFinal,laLigneFinal,carteTraitee);
	if ((typeof caseDest) == "number") {
	    // on peut effectuer le deplacement
	    tapisGlobal[index(laLigneInitial,laColInitial)] = -1; // plus de carte en initial
	    tapisGlobal[caseDest] = carteTraitee; // elle est mise en Dest
	    showAllCardsOnScreen();
	    check();
	    // ici on a la nouvelle position acceptee false=pas d'alerte sur les mouve possibles
	    work();
	    coup ++;
	    updateInfo();
	} else {
	    // on Ne doit PAS effectuer le deplacement
	    if ((laLigneInitial!=laLigneFinal) || (coteInitial!=coteFinal))
		alert(caseDest);// pas d'alerte si c'est juste un appuie/relache
	    // restauration des valeurs lors du pointeur down correpondant a 
	    elmnt.style.top = topInitial;
      	    elmnt.style.left = leftInitial;
	    elmnt.style.zIndex = zInitial;
	}
    }  // FIN function closeDragElement()
    // *********************************************************************

    function isOK(coteFinal,laLigneFinal,carteTraitee) {
	// retourne la case destination si ok ou
	// une string decrivant l'erreur sinon
	let message = "deplacemt de "+enClair(carteTraitee);
	// alert(message);
	let coulTraitee = couleur(carteTraitee);
	let caseDest=-1;
	let poseSur = -1;
	if (coteFinal==0) {
	    // colonne du milieu
	    caseDest = index(laLigneFinal,0);
	    if (tapisGlobal[caseDest]==-1)  // case vide : on ne peut poser qu'un as
		return valeur(carteTraitee)==0 ? caseDest: "on ne peut poser qu'un as ici";
	    // case non vide
	    ok = (valeur(carteTraitee)==valeur(tapisGlobal[caseDest])+1) &&
		(couleur(carteTraitee)==couleur(tapisGlobal[caseDest]))
	    return ok ? caseDest : enClair(carteTraitee)+" ne matche pas sur colonne centrale";
	}
	if (coteFinal==1) {
	    // colonne  de droite
	    caseDest = index(laLigneFinal,nbCartesDroite(laLigneFinal)+1);
	    if (nbCartesDroite(laLigneFinal)==0) 
		return (laLigneFinal==0)?caseDest : "on ne peut poser une carte sur sur la premiere colonne qu'en moustache"; 
	    // ici il y a des cartes sur la ligne de destination
	    poseSur= tapisGlobal[caseDest-1];
	    ok = ((valeur(poseSur)==valeur(carteTraitee)+1) || (valeur(poseSur)==valeur(carteTraitee)-1));
	    ok = ok && (couleur(carteTraitee)==couleur(tapisGlobal[caseDest-1]));
	} else {
	    // colonne de gauche
	    caseDest = index(laLigneFinal,nbCartesGauche(laLigneFinal)-1);
	    if (nbCartesGauche(laLigneFinal)==0) 
		return (laLigneFinal==0)?caseDest : "on ne peut poser une carte sur sur la premiere colonne qu'en moustache";
	    // ici il y a des cartes sur la ligne de destination
	    poseSur= tapisGlobal[caseDest+1];
	    ok = ((valeur(poseSur)==valeur(carteTraitee)+1) || (valeur(poseSur)==valeur(carteTraitee)-1));
	    ok = ok && (couleur(carteTraitee)==couleur(tapisGlobal[caseDest+1]));
	} // fin test de gauche/centre/droite
	return ok ? caseDest : enClair(carteTraitee)+ " ne peut aller sur "+enClair(poseSur)+" en "+unindexStr(caseDest);
    } // FIN function isOK()
    // *********************************************************************

} // FIN function makeElementDraggable(elmnt)
// *******************************************************************

function check(myTapis) {
    // return 0 si le tableau  myTapis est Ok et un code d'erreur>0 refletant les fdfferents cas
    // si myTapis est absent on teste tapisGlobal
    if (arguments.length==0)
	myTapis = [...tapisGlobal]
    var vu = new Array(52); // les cartes effectivement presentes
    vu.fill(0);
    for(let l=0;l<5;l++) {
	for(let c=-20;c<20;c++) {
	    let k = myTapis[index(l,c)];
	    if (k==-1) // Pas une carte
		continue;
	    if (c==0) {
		// traitement special de la colonne du milieu
		let coul = couleur(k);
		let val = valeur(k);
		for(let v=0;v<=val;v++)
		    vu[coul*13 + v] ++;
	    } else 
		vu[k]++;
	}
    }
    // ici on a compte l'occurence de chaque carte
    var errStr = "";
    for (let i=0;i<52;i++)
	if (vu[i]!=1) 
	    errStr+= "check: "+i+" = "+enClair(i)+" apparait "+vu[i]+" fois\n";
    if (errStr!=""){
	if (calledInBrowser)
	    alert(errStr)
	else
	    console.log(errStr)
	return 1;
    }
    // so far so good, testons les trous dans les lignes
    for (let l=0;l<5;l++) {
	for (let c=-1;c>=-nbCartesGauche2(myTapis,l);c--)
	    if (myTapis[index(l,c)]==-1) 
		errStr += "une carte mal placee en l,c="+l+","+c+"\n";
	for (let c=1;c<=nbCartesDroite2(myTapis,l);c++)
	if (myTapis[index(l,c)]==-1) 
		errStr += "check: une carte mal placee en l,c="+l+","+c+"\n";
	}
    if (errStr!=""){
	asciiOut(myTapis)
	if (calledInBrowser)
	    alert(errStr)
	else
	    console.log(errStr)
	return 2;
    }
    return 0;
}  // FIN function check(myTapis)
// *******************************************************************

function resume(tapis) {
    isUndefined(tapis,true)
    var pos = new Array(52); // les cartes effectivement presentes
    pos.fill(-1);
    for(var l=0;l<5;l++)
	for(c=-20;c<20;c++) {
	    let k = tapis[index(l,c)];
	    if (false)
		console.log("l="+l+" c="+c+" k="+k)
	    if (k==-1) // Pas une carte
    		continue;
	    if ((k<0) || (k>=52))
		alert("dans resume k= "+k);
	    if (c==0) {
		// c'est une pile de la colonne du milieu :
		let cou = couleur(k);
		let val = valeur(k);
		for (let v=0;v<=val;v++)
		    pos[karte(v,cou)]= index(l,c);
	    } else
		pos[k] = index(l,c); // ce n'est PAS une pile
	}
   return pos;
}  // FIN function resume(tapis)
// ************************************************************

function deResume(resume) {
    // re-affectation du tableau tapisGlobal a partir de resume
    if (typeof resume==='undefined') {
	alert("deResume appelle avec resume undefined");
	return;
    }
    tapisGlobal.fill(-1);
    for(let k=0;k<52;k++) {
	let l,c;
	[l,c] = unindex(resume[k]);
	tapisGlobal[index(l,c)]=k;
    }
}  // FIN function deResume()
// ************************************************************

function gagne() {
    // tour ce qu'il faut faire quand c'est gagne
    alert("gagne !!!");
    console.log(historique);
}  // FIN function gagne() 
// ************************************************************

function work() {
    // que reste-t-il a monter
    let resteAMonter = 0;// nb carte restant a monter
    for(let l=0;l<5;l++)
	resteAMonter += nbCartesDroite(l) - nbCartesGauche(l);
    if (resteAMonter==0) {
	gagne();
	return;
    }
    let res = resume(tapisGlobal);
    historique.push(res);
}  // FIN function work()    
// ************************************************************

function match(x,y) { // il faut mme couleur et y= x+/- 1
    console.log("testing "+enClair(x)+" et "+enClair(y))
    if (couleur(x)!=couleur(y))
	return false;
    if (valeur(x)==0)
	return valeur(y)==1;
    if (valeur(y)==12)
	return valeur(y)==11;
    return (valeur(x)==valeur(y)-1) || (valeur(x)==valeur(y)+1);
}  // FIN function match(x,y)
// ************************************************************

function matchante(x) { // il faut mme couleur et y= x+/- 1
    let v = valeur(x);
    let c = couleur(x);
    ans = [];
    if (v!=0)
	ans.push(karte(v-1,c));
    if (v!=12)
	ans.push(karte(v+1,c));
    return ans;
}  // FIN function matchante(x,y)
// ************************************************************

function countEltInList(el,Li) {
    // retourne le nombre d'occurence de el dans la liste Li
    let z = 0;
    for (const element of Li)
	z +=  (el==element);
    return z;
}  // FIN function countEltInList(el,Li)
// ************************************************************

// ************************************************************
//                  NOUVEAUTES POUR SOLVE
// ************************************************************
/*

  partie du code uniquement en mode ligne de commande

*/
pile = new Set();

function egalArrayNombre(A,B) {
    // test si deux tableaux de nombres contiennent les meme valeurs
    if (A.length!= B.length)
	return false;
    for(let i=0;i<A.length;i++)
	if (A[i]!=B[i])
	    return false;
    return true
}  // FIN function egalArrayNombre(A,B) {
// ****************************************************************

function isUndefined(tab,exit=false){
    // return true is one of the lelement of the array is undefined
    for(let i=0;i<tab.length;i++)
	if (typeof(tab[i]) == "undefined"){
	    if (exit) {
		console.log("exit from isUndefined");
		if (!calledInBrowser)
		    return process.exit(3);
	    }
	    return true
	}
    return false
}  // FIN function isUndefined(tab)
// ****************************************************************

function a2s(A) {
    ans = ""+A[0]
    for(let i=1;i<A.length;i++) 
	ans += "_"+A[i]
    return ans;
}  // FIN function a2s(A)
// ******************************************************************

function s2a(S) { // return the array
    let ans = S.split("_")
    return ans;
}  // FIN function a2s(A)
// ******************************************************************

function sign(i) {
    if (i<0)
	return -1
    if (i>0)
	return 1
    if (i==0)
	return 0;
    return undefined
}  // FIN function sign(i) {
// ******************************************************************

function deplace(tapis,lSrc,cSrc,lDst,cDst) { // deplacement de carte en (lSrc,cSrc) vers (lDst,cDst)
    // si pas possible return la valeur 0,
    // si possible le NOUVEAU deck (pas le tapis !)
    tr("enter deplace avec "+lSrc+" "+cSrc+" "+lDst+" "+cDst)
    if (cDst==0)
	return 0;// en colonne 0 on monte et ne deplace pas
    if ((lSrc==lDst) && (cSrc==cDst))
	return 0; // sur place !
    let tapisGlobalWork= [...tapisGlobal]
    if (cDst==0) { // destination = col 1 ou col -1
	if (lDst!=0)
	    return 0; // car colonne 1 de NON moustache
	// ici on veut monter en colonne 1 ou -1 de moustache toujours OUI
	cDst += sign(cDst)
	numWork[index(lDstt,cDst)]=numWork[index(lSrc,cSrc)]
	numWork[index(lSrc,cSrc)]=-1
	return resume(numWork)
    } // fin if ((cDst==-1) || (cDst==1)) {
    // ici on tente de deplacer en colonne>1
    let carteSrc=numWork[index(lSrc,cSrc)]
    if (carteSrc==-1)
	return 0
    let carteDes=numWork[index(lDst,cDst+sign(cDst))]
    if (carteDes!=-1)
	return 0
    if (couleur(carteSrc) != couleur(carteDes)) // pas meme couleur
	return 0 ;
    let d = valeur(carteSrc) - valeur(carteDes)
    if ((d!=1)&&(d!=-1))
	return 0; // pas consecutives
    tr("OUI!")
    return resume(numWork)
}  // FIN function deplace(lSrc,cSrc,lDst,cDst)
// ******************************************************************

function monte(tapis,lSrc,cSrc,lDst) { // monte de carte en (lSrc,cSrc) vers (lDst,0)
    // si pas possible return la valeur 0,
    // si possible le NOUVEAU deck
    tr("enter monte avec "+lSrc+" "+cSrc+" "+lDst)
    if (lDst==0)
	return 0; // rien ne va monte en ligne 0
    let numWork= [...tapisGlobal]
    let carteSrc=numWork[index(lSrc,cSrc)]
    if (carteSrc==-1)
	return 0
    let carteDes=numWork[index(lDst,0)]
    if (carteDes!=-1)
	return 0
    if (couleur(carteSrc) != couleur(carteDes)) // pas meme couleur
	return 0 ;
    let d = valeur(carteSrc) - valeur(carteDes)
    if ((d!=1)&&(d!=-1))
	return 0; // pas consecutives
     return resume(numWork)   
 }  // FINfunction monte(lSrc,cSrc,lDst,cDst)
// ******************************************************************

function forceTousMontagesInPlace(tapis,verbose=0) {
    if (verbose){
	console.log("entre dans forceTousMontagesInPlace");
	asciiOut(tapis)
    }
    while (true) {
	let b = forceUnMontageInPlace(tapis,verbose)
	if (b==0)
	    break;
    }
    if (verbose) {
	asciiOut(tapis)
	console.log("quitte forceTousMontagesInPlace");
    }
}  // FIN function forceTousMontagesInPlace(tapis)
// **************************************************************

function forceUnMontageInPlace(tapis,verbose=0) {
    // trouver une carte montable
    // s'il y en a : la monte et retourne
    // sinon retourne 0
    if (verbose)
	console.log("entre dans forceUnMontageInPlace")
    for(let l=0;l<5;l++) { //boucle sur les lignes
	for(let cote=0;cote<2;cote++) // boucle sur cte gauche/droit
	{
	    let colBout = nbCartesGauche2(tapis,l)
	    if (cote==1)
		colBout = nbCartesDroite2(tapis,l);
	    if (colBout==0)
		continue
	    let isrc = index(l,colBout);
	    let src= tapis[isrc]
	    if (src==-1)
		continue
	    if (verbose)
		console.log("essaie de monter "+src+" = "+enClair(src)+" l,c="+l+" "+colBout)
	    let coulSrc = couleur(src)
	    let valSrc = valeur(src)
	    if (valSrc==0) {// On tente de monter un as 
		for(let lp=1;lp<5;lp++){
		    let idest = index(lp,0) // emplacement central
		    if (tapis[idest]==-1) {
			// ok c'est un as et une case libre
			tapis[isrc] = -1;
			tapis[idest] = src;
			if (verbose>1) {
			    console.log("monte "+src+"="+enClair(src)+" OUI")
			    asciiOut(tapis)
			    console.log("quite forceUnMontageInPlace")
			}
			return 1;
		    }
		}
	    } else {
		// pas un as
		for(let lp=1;lp<5;lp++) { // boucle sur la destination 
		    let idest = index(lp,0)
		    let dest = tapis[idest]
		    if (dest==-1) { // case vide
			if  (lp==0) { // que sur la moustache
			    tapis[isrc]=-1;
			    tapis[idest] = src;
			    if (verbose) {
 				console.log("monte sur"+enClair(src)+"sur ma moustache"+cote)
 				asciiOut(tapis)
				console.log("quite forceUnMontageInPlace")
			    }
			    return 1;
			}
			continue; // comme lp!=0 on ne peut rien monter
		    }
		    // ici on tente de monter hors 1ere colonnes (G/D)
		    let coulDest = couleur(dest)
		    let valDest = valeur(dest)
		    o = "essaie de monter "+enClair(src)+" sur "+enClair(dest)
		    o += " "+valSrc+" "+coulSrc+"--> "+valDest+" "+coulDest
		    if ((coulDest==coulSrc) && (valDest==valSrc-1)) {
			// ok ca matche
			tapis[isrc]=-1;
			tapis[idest] = src;
			if (verbose) {
			    console.log(o+" OUI")
			    asciiOut(tapis)
			    console.log("quitte forceUnMontageInPlace")
			}
			return 1;
		    }
		    else
			if (verbose)
			    console.log(o+" NON")
		}
	    }
	} // fin for cote
    } // for(let l=0;l<5
    if (verbose)
	console.log("quite forceUnMontageInPlace SANS RIEN MONTER")
    return 0;	    
}  // FIN function forceUnMontageInPlace(tapis)
// ************************************************************

function isWon(tapis) {
    // retourne true si gagne
    for(let l=0;l<5;l++) {
	if (nbCartesGauche2(tapis,l)!=0)
	    return false
	if (nbCartesDroite2(tapis,l)!=0)
	    return false
    }
    return true
} // function isWon(verbose) 
// ***********************************************************

function solve(verbose) {
    // developpe l'arbre des coups et s'arrete
    //    soit si une feuille gagnante a ete trouvee
    //    soit si l'arbre a ete completement traverse
    // cette fonction  travaille sur tapisGlobal qui est donc sauve
    // au debut et restaure a la fin
    // si gagnable on retourne "gagnable", en mode browser une alerte est lancee
    // si non gagnable on retourne une string "0/1/2 moustache n cartes restant a monter"
    // si verbose >=5 on affiche toous les empilages et depilages
    let winable = "187_24_179_19_66_15_62_100_25_183_188_60_103_56_18_63_57_97_64_142_101_186_106_145_146_144_61_104_99_16_21_138_17_139_140_185_23_189_148_184_65_180_182_22_141_105_98_107_59_147_58_181";
    let tapisSaved = [...tapisGlobal]
    forceTousMontagesInPlace(tapisGlobal);
    let res = resume(tapisGlobal);
    const pile = []; // pile des deck (deck=tableaux de 52 entiers)
    const prof = [];
    pile.push(res);
    prof.push(1);
    const chemin = []
    let vus = new Set()
    vus.add(a2s(res))
    let feuilles = new Array()
    let uneMoust = 0;
    let deuxMoust = 0;
    let cpt = 0
    while (true) {
	cpt++;
	let cur = pile.pop()
	let p = prof.pop()
	if (verbose>5) {
	    console.log("pile.length= "+pile.length+" cpt="+cpt+ " prof="+p+" conf vues= "+vus.size);
	    asciiOut(deResume(cur))
	}
	chemin.push(cur)
	let tapis = deResume2(cur)
	// est-ce que cette conf qui n'est pas forecement une feuille a des moustaches ?
	// console.log(nbCartesGauche2(tapis,0) + " "+nbCartesDroite2(tapis,0)) bidon
	if ((nbCartesGauche2(tapis,0)==0) && (nbCartesDroite2(tapis,0)==0))
	    deuxMoust = 1;
	else if ((nbCartesGauche2(tapis,0)==0) || (nbCartesDroite2(tapis,0)==0))
	    uneMoust = 1;
	if (check(tapis)!=0) {
	    console.log("check a retourne une erreur pour")
	    asciiOut(tapis)
	    if (!calledInBrowser)
		process.exit(1)
	}
	desc = listDescendants(tapis)
	isUndefined(tapis,true); // sort si un element de ce tableau est undefined
	if (desc.length==0) {
	    feuilles.push([tapis,p])
	    chemin.pop()
	    if (isWon(tapis)) {
		// SPECIAL ON SORT TOUTE L'HISTOIRE
		for (let i=0;i<chemin.length;i++) {
		    let cur = chemin[i]
		    let tapaux = deResume2(cur)
		    // asciiOut(tapaux)
		    console.log(i)
		    asciiOutEnClair(tapaux)
		}
		if (!calledInBrowser)
		    process.exit(123);// bidon
		// FIN SPECIAL ON SORT TOUTE L'HISTOIRE
		if (verbose>=3)
		    asciiOut(tapis)
		if ((calledInBrowser) && (verbose!=-1))
		    alert("gagnable !")
		tapisGlobal = [...tapisSaved]
		console.log("gagnable moustache un deux "+uneMoust+" "+deuxMoust);
		if (calledInBrowser==false)
		    process.exit(1) ; 
		return "gagnable moustache un deux "+uneMoust+" "+deuxMoust;
	    }
	}
	for (let i=0;i<desc.length;i++) 
	    if (!vus.has(a2s(desc[i]))) {
		pile.push(desc[i])
		vus.add(a2s(desc[i]))
 		prof.push(p+1)
	    }
	if (pile.length==0)
	    break
    }
    if (verbose)
	console.log("il y a "+feuilles.length+" feuilles ")
    let best = 52;
    for(let i=0;i<feuilles.length;i++) {
	let feuille = feuilles[i][0]
	let [mousGauche,mousDroite,cartesAMonter,prof]=analyseFeuille(feuilles[i])
	if (cartesAMonter<best)
	    best = cartesAMonter
	if (verbose>=2) 
	    console.log("mousGauche,mousDroite,cartesAMonter,prof="+mousGauche+" "+mousDroite+" "+cartesAMonter+" "+prof)
	if (verbose>=3) {
	    console.log(a2s(resume(feuille)))
	    asciiOut(feuille)
	}
    }
    if (deuxMoust)
	ans = "2 moustaches possibles"
    else if (uneMoust)
	ans = "1 moustache possible"
    else
	ans = "0 moustache possible"
    ans += " moustache gauche: "+(-nbCartesGauche(0))
    ans += " moustache droite: "+nbCartesDroite(0)
    ans += ", feuille avec le moins de carte a monter "+best
    if ((calledInBrowser) && (verbose!=-1)) 
	alert(ans)
    if (verbose)
	console.log(best)

    tapisGlobal = [...tapisSaved]
    return ans;
}  // FIN function solve() 
// ************************************************************

function asciiOut(cur) {
    if (cur==undefined)
	cur = tapisGlobal
    let plusAGauche = 0
    for(let l=0;l<5;l++)
	if (nbCartesGauche2(cur,l)<plusAGauche)
	    plusAGauche = nbCartesGauche2(cur,l)
    oo=""
    for (let l=0;l<5;l++) {
	for(let c=plusAGauche;c<=nbCartesDroite2(cur,l);c++) {
	    let k = getInPlaceNonGraphique2(cur,l,c);
	    if (k==-1)
		k = "  "
	    else if (k<10)
		k = " "+k
	    if (c==0)
		oo += " | "+k+" | ";
	    else
		oo += k+" ";
	}
	oo +="\n";
    }
    console.log(oo);
}  // FIN function asciiOut(cur)
// ************************************************************

function human(k){
    // k un entier 0<=k<52 code d'une carte
    // retourne une expression lisible
    if (k==-1)
	return("  ")
    if ((k<0) || (k>=52))
	return "??"
    vals=["A","2","3","4","5","6","7","8","9","1","V","D","R"]
    fams=["K","T","C","P"]
    let f = couleur(k)
    let v = valeur(k)
    return vals[v]+fams[f]
}  // FIN function human(k)
// ************************************************************

function dehuman(h){
    // h est une sring de deux caracteres qui reprsenre une carte
    // retourne son code, et -2 sinon
    if (h.length != 2)
	return -1 // pas un code a deux caracteres
    const vals=["A","2","3","4","5","6","7","8","9","1","V","D","R"]
    const fams=["K","T","C","P"]
    const valsDown=["a","2","3","4","5","6","7","8","9","1","v","d","r"]
    const famsDown=["k","t","c","p"]
    let v = vals.indexOf(h[0])
    if (v== -1)
	v = valsDown.indexOf(h[0])
    let f = fams.indexOf(h[1])
    if (f==-1)
	f = famsDown.indexOf(h[1])
    if ((v==-1) || (h==-1))
	return -1; // un des caracteres par reconnu
    return karte(v,f)
}  // FIN function human(k)
// ************************************************************

function getFromFile(fileName) {
    // retourne le tapis corresponsant au fichier donne en argument
    // en cas d'erreur execute la fonction privee stop() 
    function stop(str) {console.log(str);process.exit(10);}
    //
    let tapis = new Array(5*(20+1+20)); // celui que l'on va rendre
    tapis.fill(-1)
    "use strict"
    const fs = require('fs')
    var text = fs.readFileSync(fileName,'utf8',function (err,data) {if (err) return console.log(err);})
    let lines = text.split("\n")
    let l = -1 // on lit la ligne i (hors commentaires)
    for (let i=0;i<lines.length;i++) {
	if (lines[i][0]=="#")
	    continue
	l = l+1
	if (l==5)
	    break
	// traitement de la ligne i
	// console.log("traitement de "+lines[i])
	let a = lines[i].split("|")
	if (a.length != 3)
	    stop("pas 3 champs")
	// traitement du champ de gauche
	let gg = a[0].split(' ')  // on va enlever les blancs --> g
	let g = []
	for (let x=0;x<gg.length;x++)
	    if (gg[x]!='')
		g.push(gg[x].trim())
	// il n y a plus de blanc dans g
	for (let x=0;x<g.length;x++){
	    let v = g[x]
	    let col = - g.length + x
	    let ind = index(l,col)
	    let mis = dehuman(v)
	    //console.log("en "+l+" "+col+" : "+v+" ie en "+ind+ " : "+mis)
	    tapis[index(l,col)] = mis
	}
	// traitement du champ central
	let v = a[1].trim()  // la carte centrale en humain
	let ind = index(l,0)
	let mis = dehuman(v)
	//console.log("en "+l+ " 0 :"+v+" ie en "+ind+ " : "+mis)
	if (v!="")
	    tapis[index(l,0)] = dehuman(v) 

	// traitement du champ de droite
	let dd = a[2].split(' ') // on va enlever les blancs --> d
	let d = []
	for (let x=0;x<dd.length;x++)
	    if (dd[x]!='')
		d.push(dd[x].trim())
	// il n y a plus de blanc dans d
	for (let x=0;x<d.length;x++){
	    let v = d[x]
	    let col = 1 + x
	    let ind = index(l,col)
	    let mis = dehuman(v)
	    //console.log("en "+l+" "+col+" : "+v+" ie en "+ind+ " : "+mis)
	    tapis[index(l,col)] = mis
	}
    }
    let verif = check(tapis)
    if (verif != 0)
	stop("check a retourne "+verif)
    return tapis
}  // FIN getFromFile()
//  *******************************************************************

function asciiOutEnClair(cur) {
    if (cur==undefined)
	cur = tapisGlobal
    let plusAGauche = 0
    for(let l=0;l<5;l++)
	if (nbCartesGauche2(cur,l)<plusAGauche)
	    plusAGauche = nbCartesGauche2(cur,l)
    oo=""
    for (let l=0;l<5;l++) {
	for(let c=plusAGauche;c<=nbCartesDroite2(cur,l);c++) {
	    let k = getInPlaceNonGraphique2(cur,l,c);
	    let hk=human(k)
	    if (c==0)
		oo += " | "+hk+" | ";
	    else
		oo += hk+" ";
	}
	oo +="\n";
    }
    console.log(oo);
} // FIN  asciiOutEnClair(cur)
// *******************************************************************

function getInPlaceNonGraphique2(curr,l,c) { //quoi en l,c
    if ((l<0) || (l>4) || (c<-20) || (c>20)) {
	//alert("oops on demande une carte hors table (get) !");
	return -1;
    }
    return curr[index(l,c)];
} // FIN function getInPlaceNonGraphique(l,c) 
// *******************************************************************

function nbCartesGauche2(cur,line) { // en realite c'est MOINS le nombre de carte gauche
    // pas de carte return 0
    // une carte return -1
    // deux cartes return -2 etc
    if ((line<0) || (line>5)) {
	//alert("nbCartesGauche: line="+line);
	return -1;
    }
    let col = -1;
    while (true) {
	if (getInPlaceNonGraphique2(cur,line,col)==-1)
	    break;
	col --;
    }
    return col+1;
}  // FIN function nbCartesGauche2(cur,line) 
// *******************************************************************

function nbCartesDroite2(cur,line) {
   // pas de carte return 0
    // une carte return -1
    // deux cartes return -2 etc
   if ((line<0) || (line>5)) {
	//alert("nbCartesGauche: line="+line);
	return -1;
    }
    let col = 1;
    while (true) {
	if (getInPlaceNonGraphique2(cur,line,col)==-1)
	    break;
	col ++;
    }
    return col-1;
}  // FIN function nbCartesDroite2(cur,line) 
// *******************************************************************

function deResume2(resume) {
    // retourne le tapis a partir de resume
    if (typeof resume==='undefined') {
	if (calledInBrowser)
	    alert("deResume2 appelle avec resume undefined")
	else
	    console.log("deResume2 appelle avec resume undefined")
	return;
    }
    let ans = new Array(5*(20+1+20));
    ans.fill(-1);
    for(let k=0;k<52;k++) {
	let l,c;
	[l,c] = unindex(resume[k]);
	ans[index(l,c)]=k;
    }
    return ans
}  // FIN function deResume2(resume)
// ************************************************************

function outDeck2(cur) {
    for(let i=0;i<52;i++)
	console.log(i+" "+cur[i]+" "+unindex(cur[i]));
}  // FIN function outDeck2(cur)
// ************************************************************

function analyseFeuille(argu) {
    // retourne uns string qui la decrit
    let tapis = argu[0]
    let prof = argu[1]
    let z = 0 // # cartes restantes a monter
    for (l=0;l<5;l++)
	z += -nbCartesGauche2(tapis,l) + nbCartesDroite2(tapis,l)
    return [ -nbCartesGauche2(tapis,0),nbCartesDroite2(tapis,0),z,prof]
}  // FIN function analyseFeuille(feuille) 
// ************************************************************

function choix(deckStr) { // appelle par le bouton choix ou dans go
    // si appelle par bouton l'argument deckStr sera undefined mais pas utilise
    // car calledInBrowser ser vrai
    // affecte le tableau global tapisGlobal en passant par le deck lu dans "zoneEntree"
    let aux;
    if (calledInBrowser) {
	let elt = document.getElementById("zoneEntree")
	aux = s2a(elt.value)
    } else aux=s2a(deckStr);
    if (aux.length!=52) {
	if (calledInBrowser) {
	    alert("donnee de longeur "+aux.length+" != 52")
	    return;
	} else {
	    console.log("donnee de longeur "+aux.length+" != 52")
	    process.exit(1)
	}
    }
    tapisGlobal = deResume2(aux)
    if (check()) {
	return
    }
    if (calledInBrowser)
	showAllCardsOnScreen();
}  // FIN choix()
// ************************************************************

function save() { // appelle par le bouton save : alerte de tapisGlobal
    let aux = resume(tapisGlobal)
    alert(a2s(aux))
}  // FIN save()
// ************************************************************

function listDescendants(tapis,verbose=0) {
    // recoit un tapis
    // retourne la liste des deck des descendants
    // travail sur tapisGlobal qui est global
    // on d'abord ce qui peut
    // on liste les index des bords de ligne
    // on essaie de deplacer sans tenir compte de la moustache
    // on essaie de monter sur la moustache
    if (verbose) {
	console.log("avant montage force")
	asciiOut(tapis)
    }
    forceTousMontagesInPlace(tapis)
    if (verbose) {
	console.log("apres montage force")
	asciiOut(tapis)
    }
    ans = []
    let indexBordPresents = []
    for(let l=0;l<5;l++) {
	let b = nbCartesGauche2(tapis,l)
	if (b<0) // il y a donc bien unecarte sur cetteligne cote gauche
	    indexBordPresents.push(index(l,b));
	b = nbCartesDroite2(tapis,l)
	if (b>0) // il y a donc bien unecarte sur cetteligne cote gauche
	    indexBordPresents.push(index(l,b));
    }
    // ici on connait les index des cartes aux bords
    // on a copie le tapis actuel pour pouvoir le restaurer
    let tapisSaved = [...tapis]
    // on va deplacer SANS LE CAS PARTICULIER DE LA MOUSTACHE
    //console.log(indexBordPresents)
    if (verbose) 
	console.log("deplacemnts SANS particularite moustache")
    for (let ksrc=0;ksrc<indexBordPresents.length;ksrc++) {
	const srcInd = indexBordPresents[ksrc]
	const srcVal = tapis[srcInd]
	for (let kdst=0;kdst<indexBordPresents.length;kdst++) {
	    const dstInd = indexBordPresents[kdst]
	    const dstVal = tapis[dstInd] 
	    if (ksrc==kdst)
		continue
	    o = srcInd+" --> "+dstInd+" "+enClair(srcVal)+" ==> "+enClair(dstVal)
	    if (couleur(srcVal)!= couleur(dstVal))
		continue
	    if ((valeur(srcVal)!=valeur(dstVal)+1)&&(valeur(srcVal)!=valeur(dstVal)-1))
		continue
	    let [lin,col] =unindex(dstInd) 
	    if (col<0)
		col--
	    else
		col++
	    tapis[index(lin,col)] = tapis[srcInd]
	    tapis[srcInd] = -1
	    if (verbose) {
		console.log("OK j'y fais! "+o)
		asciiOut(tapis)
	    }
	    ans.push(resume(tapis))
	    tapis = [...tapisSaved]
	}
    }
    if (verbose) 
	console.log("deplacemnts SPECIAL moustache")
    let b = nbCartesGauche2(tapis,0)
    if (b==0) {
	for (let ksrc=0;ksrc<indexBordPresents.length;ksrc++) {
	    const srcInd = indexBordPresents[ksrc]
	    const srcVal = tapis[srcInd]
	    const dstInd = index(0,-1)
	    tapis[dstInd] = tapis[srcInd]
	    tapis[srcInd] = -1
	    if (verbose) {
		console.log(srcInd+" --> "+dstInd)
		asciiOut(tapis)
	    }
	    ans.push(resume(tapis))
	    tapis = [...tapisSaved]
	}
    }
    b = nbCartesDroite2(tapis,0)
    if (b==0) {
	for (let ksrc=0;ksrc<indexBordPresents.length;ksrc++) {
	    const srcInd = indexBordPresents[ksrc]
	    const srcVal = tapis[srcInd]
	    const dstInd = index(0,1)
	    tapis[dstInd] = tapis[srcInd]
	    tapis[srcInd] = -1
	    if (verbose){
		console.log(srcInd+" --> "+dstInd)
		asciiOut(tapis)
	    }
	    ans.push(resume(tapis))
	    tapis = [...tapisSaved]
	}
    }
    return ans
}  // FIN function listDescendantsde(tapis)
// ****************************************************************************
	

