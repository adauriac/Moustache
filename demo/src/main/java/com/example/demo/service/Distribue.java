package com.example.demo.service;// https://www.w3schools.com/java/default.asp
import java.util.ArrayList;
import java.util.*;

public class Distribue {
    int[][] num = new int[5][20+1+20];
    String[] Cartes = {
	"Ac.gif","2c.gif","3c.gif","4c.gif","5c.gif","6c.gif","7c.gif","8c.gif","9c.gif","10c.gif","Jc.gif","Qc.gif","Kc.gif",
	"Ad.gif","2d.gif","3d.gif","4d.gif","5d.gif","6d.gif","7d.gif","8d.gif","9d.gif","10d.gif","Jd.gif","Qd.gif","Kd.gif",
	"Ah.gif","2h.gif","3h.gif","4h.gif","5h.gif","6h.gif","7h.gif","8h.gif","9h.gif","10h.gif","Jh.gif","Qh.gif","Kh.gif",
	"As.gif","2s.gif","3s.gif","4s.gif","5s.gif","6s.gif","7s.gif","8s.gif","9s.gif","10s.gif","Js.gif","Qs.gif","Ks.gif"};

    public int outCartesAscii(int verbose) {
	// sort sur sdtout les cartes et retourne le nombre d'as sortis
	//  recherches des extrema gauche et droite
	int minGauche = 20;
	int maxDroite = 20;
	for(int ligne=0;ligne<5;ligne++) {
	    int j;
	    for (j=0;j<20+1+20;j++)
		if (num[ligne][j]!=-1)
		    break;
	    if (j<minGauche)
		minGauche=j;
	    for (j=20+1+20-1;j>=0;j--)
		if (num[ligne][j]!=-1)
		    break;
	    if (j>maxDroite)
		maxDroite = j;
	}	// il y a des cartes sur ligne l entre gauche[l] et droite[l] INCLUS
	if (verbose==1) {
	    for(int l=0;l<5;l++) {
		for (int j=minGauche;j<=maxDroite;j++) {
		    if (j==21 )
			System.out.printf("| %2d | ",num[l][j]);
		    else
			System.out.printf("%2d ",num[l][j]);
		}
		System.out.print("\n");
	    }
	    System.out.printf("min Gauche = %d maxDroite = %d\n",minGauche,maxDroite);
	} // fin if (verbose
	int nba=0;
	for(int l=1;l<5;l++)
	    if (num[l][21]!= -1)
		nba++;
	return nba;
    }  // FIN     public String outCartesAscii()
    // ***************************************************************************
    
    public String outCartesHtml() {
	//  recherches des extrema gauche et droite
	// deteremination du rectangle ou il y a des cartes
	int minGauche = 20;
	int maxDroite = 20;
	for(int ligne=0;ligne<5;ligne++) {
	    int j;
	    for (j=0;j<20+1+20;j++)
		if (num[ligne][j]!=-1)
		    break;
	    if (j<minGauche)
		minGauche=j;
	    for (j=20+1+20-1;j>=0;j--)
		if (num[ligne][j]!=-1)
		    break;
	    if (j>maxDroite)
		maxDroite = j;
	}
	// il y a des cartes sur ligne l entre gauche[l] et droite[l] INCLUS SISI 
	StringBuilder result= new StringBuilder();
	String Debut= "<!DOCTYPE html>\n<html>\n<head>\n<style>\n.flex-container {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n}\n.flex-container > div {\n  width: 75px;\n  height: 96px;\n  margin: 0px;\n}\n</style>\n</head>\n<body>\n";
	result.append(Debut);

	// debut affichage des cartes
	for(int l=0;l<5;l++) {
	    result.append("<div class=\"flex-container\">\n");
	    for(int c=minGauche;c<=maxDroite;c++) {
		String fich;
		int k = num[l][c]; // code de la carte
		if (k==-1)
		    fich = "0.gif";
		else
		    fich = Cartes[k];
		result.append("<div><img src=\"").append(fich).append("\"></div>\n");
	    }
	    result.append("</div>\n");
	}  // fin for(int l=0;l<5;l++) 
	result.append("</body>\n</html>\n");

	return result.toString();
    }  // FIN     public String outCartesHtml()
    // ***************************************************************************
    
   public void distribue(){
	List<Integer> perm = new ArrayList<>();
	for(int i=0;i<20+1+20;i++) {
	    for(int j=0;j<5;j++)
		num[j][i] = -1;  // pas de carte posee
	}
	for(int i=0;i<52;i++)
	    perm.add(i);
	//Collections.shuffle(perm,new Random(1236712));
	Collections.shuffle(perm);
	// contruction
	int curL = 0;
	int curC = 20;
	for(int i=0;i<52;i++) {
	    int j = perm.get(i);
	    int coul = j/13;
	    int val = j%13;
	    if ((val==0) && (curL!=0)) { // si un as et pas ligne 0 (moustache)		
		if (num[curL][21]==-1) {
		    num[curL][21] = j;
		    continue;
		}
		num[curL][curC] = j; // affectation a la place
	    } // fin if (val==0) {
	    // ici c'est un non as ou un As mais la case du lieu est deja prise
	    num[curL][curC] = j;
	    // nouvel emplacement
	    curL++;
	    if (curL==5) { // on est a la ligne du bas
		curL = 0;
		int ecart = curC-21;
		if (ecart<0)
		    curC = 21-ecart;
		else
		    curC = 20 -ecart ;
	    }
	} // fin for(int i=0;i<52
    } // FIN distribue
    // ********************************************************************
    
    public static void main(String[] args){
	int n = Integer.parseInt(args[0]);
	System.out.println(n);
	Distribue myane = new Distribue();
	int[] accu = {0,0,0,0,0};
	for(int k=0;k<n;k++) {
	    myane.distribue();
	    int nba =  myane.outCartesAscii(0);
	    //System.out.println(nba);
	    accu[nba]++;
	}
	for (int i=0;i<5;i++) {
	    System.out.print(accu[i]*1.0/n+" ");
	}
	System.out.println();
	myane.distribue();
//	if (true) {
	    int nba =  myane.outCartesAscii(1);
	    System.out.println(nba);
//	}
//	else {
//	    String ans = myane.outCartesHtml();
//	    System.out.print(ans);
//	}
    }  // FIN class main(
}  // FIN class Distribue
// ********************************************************************


