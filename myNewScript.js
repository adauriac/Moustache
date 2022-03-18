
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
}  // FIN class RandomSeeded 
// *******************************************************************

// ****************************************************************
//                      PARAMETRES MODIFIABLES
// ****************************************************************
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
let seedSt= document.getElementById("seedId").value;
let myRnd = new RandomSeeded();  // random Generator
if (!isNaN(parseInt(seedSt)))
    myRnd.seed(parseInt(seedSt));
seed = myRnd.seedUsed;  // si c'etait -1 ce sera la valeur effectivement utilisee
document.getElementById("seedId").value = myRnd.seedUsed;
// document.getElementById("outZone").innerHTML = "C="+C+" L="+L+" isTouch="+isTouch;

// declaration
var num = new Array(5*(20+1+20)); // c'est le nom
num.fill(-1);

//Make the DIV element draggagle:
let elements = document.getElementsByClassName("mydiv");
for (let i = 0; elements[i]; i++)
     makeElementDraggable(elements[i]);

//posePersoNonGraphique();


vazy();
// showOnScreen();
//outZone += "en 0,1) "+ans
// ************************************************************
//            FUNCTIONS
// ************************************************************
function vazy() {
    //document.getElementById("go").innerHTML="fini"
    poseLesCartesNonGraphique();
    asciiOut();
    showAllCardOnScreen();
    console.log("bye 3");
}  // FIN function vazy()
// ***********************************************************

function min(x,y){return x<y ? x : y}
function max(x,y){return x>y ? x : y}

function asciiOut() {
    n0=0;
    for(let l=1;l<5;l++)
	if (getInPlaceNonGraphique(l,0)!=-1)
	    n0 += 1
    oo=""
    for (let l=0;l<5;l++) {
	for(let c=-6;c<=6;c++) {
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
	let val = j%13;
	let coul = (j-val)/13;
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
    //alert("style.z-index "+elements[carte].style.z-index);  //plante
    //alert("style.zIndex "+elements[carte].style.zIndex); // vide
    //alert(".z-index "+elements[carte].z-index); // plante
    //alert(".zIndex "+elements[carte].zIndex); // vide

    //elements[carte].style.Zindex = z;
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
    if ((C/2-cCarte/2<x-espaceMonte) && (x<C/2+cCarte/2+espaceMonte))
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
    if ((l<0) || (l>4) || (c<-20) || (c>20))
	alert("oops on demande une carte hors table !");
    return num[index(l,c)];
} // FIN whatInPlace
// *******************************************************************

function index(l,c) {
    return (20+1+20)*l+(c+20);
}  // FIN function index(l,c)
// *******************************************************************

function putInPlaceNonGraphique(k,l,c) { //quoi en l,c
    if ((l<0) || (l>4) || (c<-20) || (c>20))
	alert("oops on demande une carte hors table !");
    if ((k<0-1) || (k>51))
	alert("oops on veut placer une carte qui n'existe pas !");
    num[index(l,c)] = k;
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
	alert("nbCartesGauche: line="+line);
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
	alert("nbCartesGauche: line="+line);
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

function makeElementDraggable(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var posInitX=0,posInitY=0,posFinX=0,posFinY=0;
    var initialX=-1,initialY=-1;
    var zInitial, topInitial,leftInitial,laLineInitial,laColInitial,indiceInitial,carteTraitee;
    /*  move the DIV from anywhere inside the DIV:*/
    elmnt.style.zIndex = -1;
    elmnt.onmousedown = onMouseDown;

    function onMouseDown(e) {
      	e = e || window.event;
      	e.preventDefault();
      	// get the mouse cursor position at startup:
      	pos3 = e.clientX;
      	pos4 = e.clientY;
	posInitX = e.pageX;
      	posInitY = e.pageY;
	topInitial =elmnt.style.top;
      	leftInitial = elmnt.style.left ;
	zInitial = elmnt.style.zIndex;	
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
    } // FIN  function onMouseDown(e)
    
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
	let laLigneFinal = dsQuelleLigneEstCurseur(e.pageY) ;
	let coteFinal = deQuelCoteEstCurseur(e.pageX) ; // cote duquel on va tenter de poser
	let caseDest = 0;
	if (coteFinal==0) {
	    // colonne du milieu
	    caseDest = index(laLigneFinal,0);
	    if (num[caseDest]==-1)  // case vide : on ne peut poser qu'un as
		ok = num[indiceInitial]%13==0;
	    else
		ok = num[indiceInitial]%13==(num[caseDest]%13)+1;
	} else if (coteFinal==1) {
	    // colonne  de droite
	    caseDest = index(laLigneFinal,nbCartesDroite(laLigneFinal)+1);
	    if (nbCartesDroite(laLigneFinal)==0) 
		ok = (laLigneFinal==0); // on peut toujours su la ligne 0, jamais sinon
	    else
		ok = (num[caseDest-1]%13==(carteTraitee%13)+1) || (num[caseDest-1]%13==(carteTraitee%13)-1);
	} else {
	    // colonne de gauche
	    caseDest = index(laLigneFinal,nbCartesGauche(laLigneFinal)-1);
	    if (nbCartesGauche(laLigneFinal)==0) 
		ok = (laLigneFinal==0); // on peut toujours su la ligne 0, jamais sinon
	    else
		ok = (num[caseDest+1]%13==num[indiceInitial]%13+1) || (num[caseDest+1]%13==num[indiceInitial]%13-1);
	} // fin test de gauche/centre/droite
	if (ok) {
	    num[index(laLigneInitial,laColInitial)] = -1; // plus de carte en initial
	    num[caseDest] = carteTraitee; // elle est mise en Dest
	    showAllCardOnScreen();
	} else {
	    elmnt.style.top = topInitial;
      	    elmnt.style.left = leftInitial;
	    elmnt.style.zIndex = zInitial;
	}
    }  // FIN  function closeDragElement()
} // FIN function makeElementDraggable(elmnt)
// *******************************************************************

function valide(carteDeplacee,carteRecouverte,lineDest,colDest) {
    if (colDest==0) // en colonne 1 on peut mettre tjs en col=0, jamais sinon
	return  (lineDest==0);
    let coulDeplacee=Math.floor(carteDeplacee/13);
    let coulRecouverte=Math.floor(carteRecouverte/13);
    let valDeplacee=carteDeplacee%13;
    let valRecouverte=carteRecouverte%13;
    if (carteRecouverte==-1)  // c'est donc un as ou une erreur !
	coulRecouverte = coulDeplacee;
    if (coulDeplacee!=coulRecouverte)
	return false;
    // ici les 2 cartes sont de la meme couleur
    if (colDest==0)
	return (valDeplacee==0)|| (valDeplacee==valRecouverte+1); // au centre ca doit croitre de 1
    return (valDeplacee==valRecouverte-1) || (valDeplacee==valRecouverte+1); 
}  // FIN function valide(carteDeplacee,carteRecouverte,lineDest,colDest)
// *******************************************************************

function posePersoNonGraphique() {
    num.fill(-1);
    num [index(0,-1)] = 7;
    num [index(0,-2)] = 23;
    
    num [index(1,-1)] = 27;
    num [index(1,1)] = 24;
    num [index(1,2)] = 29;

    num [index(2,-1)] = 34;
    num [index(2,-2)] = 35;
    num [index(2,-3)] = 33;
    num [index(2,1)] = 44;
    num [index(2,2)] = 45;
    num [index(2,3)] = 46;
    
    num [index(3,-1)] = 28;

}  // FIN function posePersoNonGraphique() 
// ************************************************************

