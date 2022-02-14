// ****************************************************************
//                      PARAMETRES MODIFIABLES
// ****************************************************************
let verbose = 0; // sur la console
let margeHaut = 100, margeCentre = 20;
let lCarte = 96,cCarte = 75; // les dim sont 75x96
//cCarte = 30; // l'overlap sera 75-cCarte
let espaceMonte = 20; // espace entrev la colonne ou on monte et ses voisines
let seed = 1910298639;
// ****************************************************************
//                      FIN PARAMETRES MODIFIABLES
// ****************************************************************

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

    // Returns number between 0 (inclusive) and 1 (exclusive) //4294967296
    // just like Math.random().
    random() {
	this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
	this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
	var result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
	return result/4294967296;
    } // fin random()
}  // FIN class randomSeeded 
// *******************************************************************

// parametre de la tabelette ou ordi
var isTouch = 'ontouchstart' in document.documentElement;
let C = screen.width; // nombre de colonnes de pixels
let L = screen.height; // nombre de lignes de pixels
// document.getElementById("outZone").innerHTML = "C="+C+" L="+L+" isTouch="+isTouch;

// declaration
var num = new Array(5*(20+1+20)); // c'est le nom
num.fill(-1);
let tour = 0;

//Make the DIV elements
let elements = document.getElementsByClassName("mydiv");

myRnd = new RandomSeeded();  // random Generator
if (seed != -1)
    myRnd.seed(seed);
seed = myRnd.seedUsed;

poseLesCartes();
asciiOut();
showAllCardScreen();
var btn = document.getElementById("boutonNext");
btn.innerHTML=seed + " j'ai fini le premier tour1";
console.log("bye 3");
// showOnScreen();
//outZone += "en 0,1) "+ans
// ************************************************************
//            FUNCTIONS
// ************************************************************

function asciiOut() {
    n0=0;
    for(let l=1;l<5;l++)
	if (getInPlace(l,0)!=-1)
	    n0 += 1
    oo=""
    for (let l=0;l<5;l++) {
	for(let c=-6;c<=6;c++) {
	    let k = getInPlace(l,c);
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
	let k = getInPlace(l,0);
	ooo += k+" "
    }
    console.log(ooo);
}  // FIN function asciiOut()
// ************************************************************

function rePoseLesCartes() {
    let talon=[],ntalon=0; // pour accumuler les cartes a redistribuer
    for (let l=1;l<5;l++) {
	for(let c=-20;c<20;c++) {
	    if (c==0)
		continue;
	    let k = getInPlace(l,c);
	    if (k==-1)
		continue;
	    talon[ntalon++]=k;
	    putInPlace(-1,l,c);
	}
	console.log("rePoseLesCartes: "+ntalon+" cartes a redistribuer");
    }
    shuffle(talon);
    let curL = 1;
    let curC = -1;
    for(let i=0;i<talon.length;i++) {
	let j = talon[i];
	let val = j%13;
	let coul = (j-val)/13;
	putInPlace(j,curL,curC);
	console.log("i,curL,curC="+i+" "+curL+" "+curC);
	curL++;
	if (curL==5) { // on est a la ligne du bas
	    curL = 1;
	    if (curC<0)
	        curC= -curC;
	    else
		curC = -curC-1;
	}
    } // fin for(int i=0;i<52
    showAllCardScreen();
    makeBordsDragabbles();
}  // FIN function rePoseLesCartes()
// ************************************************************

function poseLesCartes() {
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
	let val = j%13;
	let coul = (j-val)/13;
	let k;
	if ((val==0) && (curL!=0) ) { // si un as et pas ligne 0 (moustache)
	    k = getInPlace(curL,0);
	    if (k==-1) { // la colonne du milieu de ctee ligne est vide
		putInPlace(j,curL,0);
		continue;
	    }
	} // fin if (val==0) && (curL!=0)
	// ici c'est un non as ou un As mais la case du lieu est deja prise
	putInPlace(j,curL,curC);
	curL++;
	if (curL==5) { // on est a la ligne du bas
	    curL = 0;
	    if (curC<0)
	        curC= -curC;
	    else
		curC = -curC-1;
	}
    } // fin for(int i=0;i<52
    makeBordsDragabbles();
}  // FIN function poseLesCartes()
// *******************************************************************

function shuffle(array) {
    // from https://javascript.info/task/shuffle
    // utilise l'algo de Fisher-Yates aka Knuth
    // les tests en freq. sont ok
    for (let i = array.length - 1; i > 0; i--) {
//	let j = Math.floor(Math.random() * (i + 1));
	let j = Math.floor(myRnd.random() * (i + 1));
	[array[i], array[j]] = [array[j], array[i]];
    }
}  // FIN function shuffle(array)
// *******************************************************************

function makeBordsDragabbles() {
    // rend draggable les bords 
    let cpt = 0;
    // recherche de bords
    let bordNeg = -20,bordPos = 20;
    for(let l=0;l<5;l++) {
	let bordVu = 0;
	for (let c=-20;c<0;c++) {
	    let k = getInPlace(l,c);
	    if (k==-1)  // ce n'est pas une carte
		continue
	    // ici c'est bien une carte
	    if (!bordVu)
		makeElementDraggable(elements[k]);
	    else
		makeElementNonDraggable(elements[k]);
	    bordVu = 1;
	    elements[k].style.zIndex = -c;
	} // fin for (let c=-20;c<0;c++)
	bordVu = 0;	
 	for (let c=20;c>0;c--) {
	    let k = getInPlace(l,c);
	    if (k==-1)  // ce n'est pas une carte
		continue
	    // ici c'est bien une carte
	    if (!bordVu)
		makeElementDraggable(elements[k]);
	    else
		makeElementNonDraggable(elements[k]);
	    bordVu = 1;
	    elements[k].style.zIndex = c;
	} // fin for (let c=20;c>0;c--)
    } // fin for(let l=0;l<5;l++)
}  //FIN function makeBordsDragabbles() {
// *******************************************************************

function showOneCardScreen(carte,ligne,col) {
    // affiche la carte carte en position ligne col
    if ((carte<0) || (carte>=52)){
	alert("oops showOneCardScreen: carte invalide "+carte);
    }
    if ((ligne<0) || (ligne>=5) || (col<0) || (col>=20+1+20)){
    }
    // ici la carte et la position sont oks
    let X = C/2-cCarte/2 + col*cCarte;
    if (col<0)
	X -= espaceMonte;
    else if (col>0)
	X += espaceMonte;
    let Y = ligne*lCarte;
    elements[carte].style.left = X+"px"; // c'est la colonne
    elements[carte].style.top = Y+"px"; // c'est la ligne
}  // FIN function showOneCardScreen(carte,ligne,col) 
// *******************************************************************

function dsQuelleCaseEstCurseur(x,y) {
    let col=-1,lin=-1;
    if ((C/2-cCarte/2<x) && (x<C/2+cCarte/2))
	col = 0;
    if (C/2+cCarte/2+margeCentre<x)
	col=Math.floor((x-(C/2+cCarte/2+margeCentre))/cCarte);
    lin = Math.floor((y-lCarte)/lCarte);
    console.log("x,y= ",x,y," col,lin= ",col,lin);
    return [col,lin];
}  // FIN function dsQuelleCaseEstCurseur()
// ******************************************************************

function showAllCardScreen() {
    // affiche toutes les cartes
    for(let l=0;l<5;l++) {
	for (let c=-20;c<=20;c++) {
	    let k = getInPlace(l,c);
	    if (k==-1) // donc pas de carte
		continue;
	    showOneCardScreen(k,l,c);
	}
    }
}  // FIN function showOneCardScreen(carte,ligne,col) 
// *******************************************************************

function getInPlace(l,c) { //quoi en l,c
    if ((l<0) || (l>4) || (c<-20) || (c>20))
	alert("oops getInPlace on demande une carte hors table !"+l+c);
    return num[(20+1+20)*l+(c+20)];
} // FIN whatInPlace
// *******************************************************************

function putInPlace(k,l,c) { //quoi en l,c
    if ((l<0) || (l>4) || (c<-20) || (c>20))
	alert("oops putInPlace on demande une carte hors table ! l,c="+l+","+c);
    if ((k<0-1) || (k>51))
	alert("oops putInPlace on veut placer une carte qui n'existe pas !"+k);
    num[(20+1+20)*l+(c+20)] = k;
} // FIN whatInPlace
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

function casePosFromMousePos(posInitX,posInitY) {
    // retourne [ligne,colonne] a partir de la position (poxX,posY) en pixels
    let col = -1;
    if ((C/2-cCarte/2-margeCentre<posInitX) && (posInitX<C/2+cCarte/2+margeCentre))
	col = 0;
    else if (posInitX<C/2-cCarte/2-margeCentre)
	col = Math.floor( (posInitX-(C/2-cCarte/2-margeCentre))/cCarte);
    else if (C/2-cCarte/2-margeCentre<posInitX)
	col = Math.floor( (posInitX-(C/2+cCarte/2+margeCentre))/cCarte) + 1;
    let ligne = Math.floor(posInitY/lCarte);
    return [ligne,col];
}  // FIN function casePosFromMousePos(posX,posY)
// *******************************************************************

function cartesConsecutives(avant,apres) { // vrai si meme couleur et apres=avant+1
    let valav = avant%13;
    let coulav = (avant-valav)/13;
    let valap = apres%13;
    let coulap = (apres-valap)/13;
    return (coulav==coulap) && (valap=valav+1);
}  // FIN function cartesConsecutives(avant,apres)
// *******************************************************************

function mettable(carte,line,col) {
    // retourne 1 ou 0 suivant que l'on peut mettre la carte
    if (col==0){// on cherche a mettre en col 0 (monter)
	if (line==0)
	    return 0;
	let dejala = getInPlace(line,col);
	if (dejala==-1)  // il n'y avait rien on ne peut mettre qu'un as
	    return carte%13==0;
	// il y avait qq chose on ne peut mettre que la suivante
	return cartesConsecutives(dejala,carte);
    }
    // ici on ne cherche pas a mettre en col 0 (monter)
    if ((col==1) || (col==-1)) 
	return (line==0); // on ne peut mettre que si c'est la moustache
    // ici ce n'est la colonne 1 ou -1
    let colVois=0;
    if (col<0)
	colVois = col+1;
    else
	colVois = col-1;
    voisine = getInPlace(line,colVois);
    if (voisine==-1)
	return 0;
    let val = carte%13;
    let coul = (carte-val)/13;
    let valVois = voisine%13;
    let coulVois = (voisine-valVois)/13;
    return (coul==coulVois) && (Math.abs(val-valVois)==1);
}  // FIN function mettable(carte,line,col)
// *******************************************************************

function makeElementNonDraggable(elmnt) {
    elmnt.onmousedown = null;
    elmnt.onmouseup = null;
    elmnt.onmousemove = null;
}  // FIN function makeElementNonDraggable(elmnt)
// *******************************************************************

function nextTour() {
    var btn = document.getElementById("boutonNext");
    tour++;
    console.log("tour "+tour);
    if (tour==1)
	btn.innerHTML=seed + " j'ai fini le deuxieme tour";
    else if (tour==2)
	btn.innerHTML = seed+" j'ai fini le troisieme tour";
    else {
	alert("NON c'est fini");
	return;
    }
    rePoseLesCartes();
}  // FIN function nextTour()
// *******************************************************************

function makeElementDraggable(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var posInitX=0,posInitY=0,posFinX=0,posFinY=0;
    var initialX=-1,initialY=-1;
    var lineInit=-1,colInit=-1;
    var k = -1;// ce sera le noumero de la carte 
    /*  move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      	e = e || window.event;
      	e.preventDefault();
      	// get the mouse cursor position at startup:
      	pos3 = e.clientX;
      	pos4 = e.clientY;
	posInitX = e.pageX;
      	posInitY = e.pageY;
	[lineInit,colInit] =  casePosFromMousePos(posInitX,posInitY);
	k = getInPlace(lineInit,colInit);  //c'est la carte k que l'on promene
      	document.onmouseup = closeDragElement;
      	// call a function whenever the cursor moves:
      	document.onmousemove = elementDrag;
    } // FIN  function dragMouseDown(e)
    
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
    } // FIN elementDrag(e)

    function closeDragElement(e) {
      	/* stop moving when mouse button is released:*/
      	e = e || window.event; // rajoute par JC
      	e.preventDefault(); // rajoute par JC
      	document.onmouseup = null;
      	document.onmousemove = null;
	posFinX = e.clientX;
      	posFinY = e.clientY;
 	[lineFin,colFin] =  casePosFromMousePos(posFinX,posFinY);
	// Puis-je placer cette carte ici ?
	let ok = (colInit!=0) && mettable(k,lineFin,colFin);
	if (ok) {
	    putInPlace(-1,lineInit,colInit); // plus rien en lineInit,colInit
	    putInPlace(k,lineFin,colFin); // k affecte lors du mouse down
	    showOneCardScreen(k,lineFin,colFin);
	    makeElementDraggable(elements[k]);
	    makeBordsDragabbles();
	} else {
	    showOneCardScreen(k,lineInit,colInit);
	}
    }  // FIN  function closeDragElement()
} // FIN function makeElementDraggable(elmnt)
// ************************************************************************

