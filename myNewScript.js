
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

// ****************************************************************
//                      PARAMETRES MODIFIABLES
// ****************************************************************
// console.log("debut du script");
let verbose = 0; // sur la console
let margeHaut = 100, margeCentre = 20;
let lCarte = 96,cCarte = 75; // les dim sont 75x96
let espaceMonte = 20; // espace entre la colonne ou on monte et ses voisines
let chevauche = 40; // chevauchement des cartes
let bandeauEnHaut = 50; // pour les boutons
// ****************************************************************
//                      FIN PARAMETRES MODIFIABLES
// ****************************************************************
// parametre de la tabelette ou ordi
var isTouch = 'ontouchstart' in document.documentElement;
let C = screen.width; // nombre de colonnes de pixels
let L = screen.height; // nombre de lignes de pixels
// declaration
var num = new Array(5*(20+1+20)); // 5 lignes et 20 cases a gauche 1 case centrale et 20 cases a droite
num.fill(-1); // -1 veut dire pas de carte. ATTENTION en colonne centrake (col=0) il y a une pile de cartes
//Make the DIV element draggagle:
let elements = document.getElementsByClassName("mydiv");
for (let i = 0; elements[i]; i++)
    makeElementDraggable(elements[i]);
let helpBtn = document.getElementById("help")
helpBtn.style.left = C/2-cCarte/2+"px";
helpBtn.style.top = bandeauEnHaut+"px";
let coup,tour;
let myRnd = new RandomSeeded();  // random Generator
let historique;
let noAlert = false;
let mode="simple";
go();
// ************************************************************
//            FUNCTIONS
// ************************************************************
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

function go(seedSt) {
    // let seedSt = getParameter("seedId"); // on lit dans l'url
    // seedSt= document.getElementById("seedId").value
    if (!isNaN(parseInt(seedSt)))  // si seedSt est un nombre
	myRnd.seed(parseInt(seedSt));
    else
	myRnd.reSeed();
    seed = myRnd.seedUsed;  // si c'etait -1 ce sera la valeur effectivement utilisee
    document.getElementById("seedId").value = myRnd.seedUsed;
    historique = [];
    tour = 1;
    coup = 1;
    updateInfo();
    poseLesCartesNonGraphique();
    // asciiOut();
    showAllCardOnScreen();
    let res = resume(num);
    historique.push(res);
}  // FIN function go(seedSt)
// ************************************************************

function switchMode() {
    // passage du mode "simple" ou mode "full"
    alert("Beaucoup d'améliorations prévues. Pas encore implementé")
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
    showAllCardOnScreen();
    tour ++;
    coup = 1;
    updateInfo();}  // FIN function nextTour()
// ***********************************************************

function annuleDernierCoup(){
    if (historique.length==1) // pour les cretins qui font undo au 1er coup
	return;
    historique.pop();
    let ancien = historique[historique.length-1];
    deResume(ancien) ;
    showAllCardOnScreen();
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
	    let k = num[index(l,c)];
	    if (k==-1) // donc pas de carte
		continue;
	    reste.push(k);
	    num[i]= -1;
	}
    }
    shuffle(reste);
    let col = -1;
    let line = 1;
    for (let i=0;i<reste.length;i++) {
	num[index(line,col)] = reste[i];
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
	    let carteBout = num[index(l,nbg)];
	    let aux = matchante(carteBout);
	    carteMatchantes = carteMatchantes.concat(aux);
	}
	let nbd = nbCartesDroite(l);
	if (nbd!=0) {
	    let carteBout = num[index(l,nbd)];
	    let aux = matchante(carteBout);
	    carteMatchantes = carteMatchantes.concat(aux);
	}
    } 
    //console.log("carteMatchantes "+carteMatchantes);
    // cartes montantes
    carteMontantes = [];
    for (let l=1;l<5;l++) 
	if (num[index(l,0)]==-1){
	    // case vide tout as peux monter
	    for(let x=0;x<4;x++)
		carteMontantes.push(13*x);
	} else if (num[index(l,0)] != 12)
	    carteMontantes.push(num[index(l,0)]+1);
    //console.log("carteMontantes "+carteMontantes);
    let zMont = 0;
    let zMatch = 0;
    for(var l=0;l<5;l++) {
     	let nbg = nbCartesGauche(l);
	if (nbg!=0) {
    	    let carteTestee = num[index(l,nbg)];
	    zMatch += countEltInList(carteTestee,carteMatchantes);
	    zMont += countEltInList(carteTestee,carteMontantes);
     	}
	let nbd = nbCartesDroite(l);
    	if (nbd!=0) {
     	    let carteTestee = num[index(l,nbd)];
	    zMatch += countEltInList(carteTestee,carteMatchantes);
	    zMont += countEltInList(carteTestee,carteMontantes);
     	}
    }
    alert("il reste "+resteAMonter+" cartes a monter et il y a "+zMatch+" matchs et "+zMont+" carte(s) qui monte(nt)");
}  // FIN function help()
// ************************************************************

function asciiOut() {
    n0=0;
    for(let l=1;l<5;l++)
	if (getInPlaceNonGraphique(l,0)!=-1)
	    n0 += 1
    oo=""
    for (let l=0;l<5;l++) {
	for(let c=-20;c<=20;c++) {
	    let k = getInPlaceNonGraphique(l,c);
	    if (c==1)
		oo += " ";
	    oo += k+" ";
	    if (c==-1)
		oo+=" ";
	}
	oo +="\n";
    }
    console.log(oo);
    ooo=""
    for (let l=1;l<5;l++) {
	let k = getInPlaceNonGraphique(l,0);
	ooo += k+" "
    }
    console.log(ooo);
}  // FIN function asciiOut()
// ************************************************************

function poseLesCartesNonGraphique() {
    // CONTRUIT LE TABLEAU GLOBAL num EN POSANT
    // LES CARTES AVEC LA REGLE DES AS QUI MONTENT DIRECT
    // SI LA CASE CENTRALE DE CETTE LIGNE EST VIDE.
    // 
    // on va construire une permuation de 0..51
    var P = new Array(52); // la permutation
    for (let i=0;i<52;i++)
	P[i] = i;
    shuffle(P);
    // on reinitilaise
    num.fill(-1);
    let curL = 0;
    let curC = -1;
    for(let i=0;i<52;i++) {
	let j = P[i];
	//	let val = j%13;
	//	let coul = (j-val)/13;
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
    // from https://javascript.info/task/shuffle
    // utilise l'algo de Fisher-Yates aka Knuth
    // les tests en freq. sont ok
    for (let i = array.length - 1; i > 0; i--) {
	let j = Math.floor(myRnd.random() * (i + 1));
	[array[i], array[j]] = [array[j], array[i]];
    }
}  // FIN function shuffle(array)
// *******************************************************************

function showOneCardOnScreen(carte,ligne,col) {
    // affiche la carte carte en position ligne col
    if ((carte<0) || (carte>=52)){
	alert("oops showOneCardOnScreen: carte invalide "+carte);
    }
    if ((ligne<0) || (ligne>=5) || (col<0) || (col>=20+1+20)){
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
}  // FIN function showOneCardOnOnScreen(carte,ligne,col) 
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

function showAllCardOnScreen() {
    // affiche toutes les cartes
    for(let l=0;l<5;l++) {
	for (let c=-20;c<=20;c++) {
	    let k = getInPlaceNonGraphique(l,c);
	    if (k==-1) // donc pas de carte
		continue;
	    showOneCardOnScreen(k,l,c);
	}
    }
}  // FIN function showAllCardOnScreen() 
// *******************************************************************

function getInPlaceNonGraphique(l,c) { //quoi en l,c
    if ((l<0) || (l>4) || (c<-20) || (c>20)) {
	//alert("oops on demande une carte hors table (get) !");
	return -1;
    }
    return num[index(l,c)];
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
    num[index(l,c)] = k;
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

function nbCartesGauche(line) {
    if ((line<0) || (line>5)) {
	//alert("nbCartesGauche: line="+line);
	return -1;
    }
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
    document.getElementById("outZone").innerHTML = "Vous allez jouer le coup "+coup+" du tour "+tour+" de la partie "+myRnd.seedUsed;
}  // FIN function updateInfo()
// *******************************************************************

function makeElementDraggable(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var posInitX=0,posInitY=0,posFinX=0,posFinY=0;
    var initialX=-1,initialY=-1;
    var zInitial, topInitial,leftInitial,laLineInitial,laColInitial,indiceInitial,carteTraitee,coteInitial;
    /*  move the DIV from anywhere inside the DIV:*/
    elmnt.style.zIndex = -1;
    elmnt.onmousedown = onMouseDown;

    function onMouseDown(e) {
      	e = e || window.event;
	if (e.button != 0)
	    return ;
      	e.preventDefault();
      	// get the mouse cursor position at startup:
      	pos3 = e.clientX;
      	pos4 = e.clientY;
	posInitX = e.pageX;
      	posInitY = e.pageY;
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
	carteTraitee = num[indiceInitial];
	let k = laColInitial<0 ? nbCartesGauche(laLigneInitial): nbCartesDroite(laLigneInitial);
	k = k<0 ? -k : k;
	let id = elmnt.id;
//	console.log("je prend "+id+" carteTraitee="+carteTraitee+" en ("+laLigneInitial+","+laColInitial+") indice="+indiceInitial);
	// a t on le droit de prendre cette carte ?
	if (k==zInitial) {
	    elmnt.style.zIndex = 100;
     	    document.onmouseup = closeDragElement;
      	    // call a function whenever the cursor moves:
      	    document.onmousemove = elementDrag;
	} else {
     	    document.onmouseup = null;
      	    document.onmousemove = null;
	}
    } // FIN function onMouseDown(e)
    
    function elementDrag(e) {
      	e = e || window.event;
      	e.preventDefault();
      	// calculate the new cursor position:
      	pos1 = pos3 - e.clientX;
      	pos2 = pos4 - e.clientY;
      	pos3 = e.clientX;
      	pos4 = e.clientY;
      	// set the element's new position:
      	elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      	elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    } // FIN function elementDrag(e)

    function closeDragElement(e) {
      	/* stop moving when mouse button is released:*/
      	e = e || window.event; // rajoute par JC
      	e.preventDefault(); // rajoute par JC
      	document.onmouseup = null;
      	document.onmousemove = null;
	posFinX = e.clientX;
      	posFinY = e.clientY;
	let laLigneFinal = dsQuelleLigneEstCurseur(e.pageY) ;
	if (laLigneFinal>=5) { //on ne peut poser de cartesur cette ligne
	    elmnt.style.top = topInitial;
      	    elmnt.style.left = leftInitial;
	    elmnt.style.zIndex = zInitial;
	    return;
	}
	let coteFinal = deQuelCoteEstCurseur(e.pageX) ; // cote duquel on va tenter de poser
	let caseDest = isOK(coteFinal,laLigneFinal,carteTraitee);
	if ((typeof caseDest) == "number") {
	    num[index(laLigneInitial,laColInitial)] = -1; // plus de carte en initial
	    num[caseDest] = carteTraitee; // elle est mise en Dest
	    showAllCardOnScreen();
	    check();
	    // ici on a la nouvelle position acceptee false=pas d'alerte sur les mouve possibles
	    work();
	    coup ++;
	    updateInfo();
	} else {
	    // pas d'alerte si c'est juste un appuie/relache
	    if ((laLigneInitial!=laLigneFinal) || (coteInitial!=coteFinal))
		alert(caseDest);
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
	    if (num[caseDest]==-1)  // case vide : on ne peut poser qu'un as
		return valeur(carteTraitee)==0 ? caseDest: "on ne peut poser qu'un as ici";
	    // case non vide
	    ok = (valeur(carteTraitee)==valeur(num[caseDest])+1) &&
		(couleur(carteTraitee)==couleur(num[caseDest]))
	    return ok ? caseDest : enClair(carteTraitee)+" ne matche pas sur colonne centrale";
	}
	if (coteFinal==1) {
	    // colonne  de droite
	    caseDest = index(laLigneFinal,nbCartesDroite(laLigneFinal)+1);
	    if (nbCartesDroite(laLigneFinal)==0) 
		return (laLigneFinal==0)?caseDest : "on ne peut poser une carte sur sur la premiere colonne qu'en moustache"; 
	    // ici il y a des cartes sur la ligne de destination
	    poseSur= num[caseDest-1];
	    ok = ((valeur(poseSur)==valeur(carteTraitee)+1) || (valeur(poseSur)==valeur(carteTraitee)-1));
	    ok = ok && (couleur(carteTraitee)==couleur(num[caseDest-1]));
	} else {
	    // colonne de gauche
	    caseDest = index(laLigneFinal,nbCartesGauche(laLigneFinal)-1);
	    if (nbCartesGauche(laLigneFinal)==0) 
		return (laLigneFinal==0)?caseDest : "on ne peut poser une carte sur sur la premiere colonne qu'en moustache";
	    // ici il y a des cartes sur la ligne de destination
	    poseSur= num[caseDest+1];
	    ok = ((valeur(poseSur)==valeur(carteTraitee)+1) || (valeur(poseSur)==valeur(carteTraitee)-1));
	    ok = ok && (couleur(carteTraitee)==couleur(num[caseDest+1]));
	} // fin test de gauche/centre/droite
	return ok ? caseDest : enClair(carteTraitee)+ " ne peut aller sur "+enClair(poseSur)+" en "+unindexStr(caseDest);
    } // FIN function isOK()

} // FIN function makeElementDraggable(elmnt)
// *******************************************************************

function check() {
    // return 0 si Ok et un code d'erreur>0 refletant les fifferents cas
    var vu = new Array(52); // les cartes effectivement presentes
    vu.fill(0);
    for(let l=0;l<5;l++) {
	for(let c=-20;c<20;c++) {
	    let k = num[index(l,c)];
	    if (k==-1) // Pas une carte
		continue;
	    if (c==0) {
		// traitement special de la colonne du milieu
		// let coul = Math.floor(k/13);
		// let val = k%13;
		// for(let v=0;v<=val;v++)
		//     vu[coul*13 + v] ++;
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
	alert(errStr);
	return 1;
    }
    // so far so good, testons les trous dans les lignes
    for (let l=0;l<5;l++) {
	for (let c=-1;c>=-nbCartesGauche(l);c--)
	    if (num[index(l,c)]==-1) 
		errStr += "une carte mal placee en l,c="+l+","+c+"\n";
	for (let c=1;c<=nbCartesDroite(l);c++)
	if (num[index(l,c)]==-1) 
		errStr += "check: une carte mal placee en l,c="+l+","+c+"\n";
	}
    if (errStr!=""){
	alert(errStr);
	return 2;
    }
    return 0;
}  // FIN function check()
// *******************************************************************

function posePersoNonGraphique() {
    // bug trouve par JA
    num.fill(-1);
// ligne 0
    num [index(0,-4)] = 9;
    num [index(0,-3)] = 8;
    num [index(0,-2)] = 7;
    num [index(0,-1)] = 6;
    
    num [index(0,1)] = 38;
// ligne 1
    num [index(1,-4)] = 17;
    num [index(1,-3)] = 31;
    num [index(1,-2)] = 46;
    num [index(1,-1)] = 25;
    
    num [index(1,0)] = 5;
    
    num [index(1,1)] = 32;
    num [index(1,2)] = 44;
    num [index(1,3)] = 23;
    num [index(1,4)] = 24;
// ligne 2
    num [index(2,-4)] = 18;
    num [index(2,-3)] = 50;
    num [index(2,-2)] = 49;
    num [index(2,-1)] = 47;
    
    num [index(2,0)] = 13;
    
    num [index(2,1)] = 15;
    num [index(2,2)] = 30;
    num [index(2,3)] = 33;
    num [index(2,4)] = 12;
// ligne 3
    num [index(3,-4)] = 14;
    num [index(3,-3)] = 20;
    num [index(3,-2)] = 43;
    num [index(3,-1)] = 19;
    
    num [index(3,0)] = 42;
    
    num [index(3,1)] = 45;
    num [index(3,2)] = 16;
    num [index(3,3)] = 11;
    num [index(3,4)] = 34;
// ligne 4
    num [index(4,-4)] = 36;
    num [index(4,-3)] = 35;
    num [index(4,-2)] = 21;
    num [index(4,-1)] = 48;
    
    num [index(4,0)] = 29;
    
    num [index(4,1)] = 10;
    num [index(4,2)] = 22;
    num [index(4,3)] = 37;
    num [index(4,4)] = 51;

    // pour cacher les cartes non posees
    // quelles sont-elles ?
    var vu = new Array(52); // les cartes effectivement presentes
    vu.fill(0);
    // for(let l=0;l<5;l++) {
    // 	for(let c=-20;c<20;c++) {
    // 	    let k = num[index(l,c)];
    // 	    if (k==-1) // Pas une carte
    // 		continue;
    // 	    vu[k] = 1;

}  // FIN function posePersoNonGraphique() 
// ************************************************************

function resume(num) {
    // creation d'un seul tableau de 52 entiers qui resume la situation
    var pos = new Array(52); // les cartes effectivement presentes
    pos.fill(-1);
    for(var l=0;l<5;l++)
	for(c=-20;c<20+1+20;c++) {
	    let k = num[index(l,c)];
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
}  // FIN function resume()
// ************************************************************

function deResume(resume) {
    // re-affectation du tableau num a partir de resume
    if (typeof resume==='undefined') {
	alert("deResume appelle avec resume undefined");
	return;
    }
    num.fill(-1);
    for(let k=0;k<52;k++) {
	let l,c;
	[l,c] = unindex(resume[k]);
	num[index(l,c)]=k;
    }
}  // FIN function deResume()
// ************************************************************

function gagne() {
    // tour ce qu'il faut faire quans c'est gagne
    alert("gagne !!!");
    console.log(historique);
}  // FIN function gagne() 
// ************************************************************

function work() {
    // que reste-t-il a monter
    let res = resume(num);
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
}  // FIN function match(x,y)
// ************************************************************

function countEltInList(el,Li) {
    // retourne le nombre d'occurence de el dans la liste Li
    let z = 0;
    for (const element of Li)
	z +=  (el==element);
    return z;
}  // FIN function countEltInList(el,Li)
// ************************************************************
