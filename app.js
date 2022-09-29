
const calculatorData = {
    calculation : "",
    result: "",
    displayedResults: false,
}


// On récupère tous nos boutons via un spread operator de la nodelist récupérée
const buttons = [...document.querySelectorAll("[data-action]")];


// On teste si l'attribut "data-action" se situe dans la Regex de 0 à 9 (donc s'il s'agit d'un bouton digit)
const digitsBtns = buttons.filter(button => /[0-9]/.test(button.getAttribute("data-action")));

digitsBtns.forEach(btn => btn.addEventListener('click', handleDigits));


const calculationDisplay = document.querySelector(".calculation");
const resultDisplay = document.querySelector(".result");


// Au click sur le bouton digit (chiffre), on récupère sa valeur avec l'attribut data-action
function handleDigits(e) {
    const buttonValue = e.target.getAttribute('data-action');

    // Si on affiche déjà un résultat, on reset le calcul
    if (calculatorData.displayedResults) {
        calculationDisplay.textContent = "";
        calculatorData.calculation = "";
        calculatorData.displayedResults = false;
    }
    // Si le total est à 0 (au départ) et qu'on essaye d'ajouter un 0 supplémentaire, on prévient l'action
    else if (calculatorData.calculation === "0") calculatorData.calculation = "";

    // Ensuite au click sur le bouton, on ajoute bien le chiffre à la string en cours
    calculatorData.calculation += buttonValue;
    resultDisplay.textContent = calculatorData.calculation;
}


// On récupère les opérateurs ajouter, soustraire, multiplier et diviser
const operatorsBtns = buttons.filter(button => /[\/+*-]/.test(button.getAttribute("data-action")));

operatorsBtns.forEach(btn => btn.addEventListener('click', handleOperators));


function handleOperators(e) {
    const buttonValue = e.target.getAttribute('data-action');

    // Si on affiche déjà un résultat au moment de recliquer sur un opérateur
    if (calculatorData.displayedResults) {
        // On efface l'ancien calcul
        calculationDisplay.textContent = "";
        // Et on repart directement du résultat
        calculatorData.calculation = calculatorData.result += buttonValue;
        resultDisplay.textContent = calculatorData.calculation;
        calculatorData.displayedResults = false;
        return;
    }
    // Si le total est à 0 (départ) et qu'on clique sur - , on affichera une valeur négative
    else if (!calculatorData.calculation && buttonValue === "-") {
        calculatorData.calculation += buttonValue;
        resultDisplay.textContent = calculatorData.calculation;
        return;
    }
    // Si le total est à 0 (départ), ou que le dernier caractère est un point, et qu'on clique un autre opérateur, on prévient l'action
    else if (!calculatorData.calculation || calculatorData.calculation.slice(-1) === ".") return;
    // Si le dernier caractère de la chaîne est un opérateur et qu'on essaye de rajouter un opérateur supplémentaire, on remplace l'ancien opérateur par le nouveau
    else if (calculatorData.calculation.slice(-1).match(/[\/+*-]/) && calculatorData.calculation.length !== 1) {
        calculatorData.calculation = calculatorData.calculation.slice(0, -1) + buttonValue;
        resultDisplay.textContent = calculatorData.calculation;
    }
    // Si le seul caractère de la string est un - et qu'on clique un autre opérateur, on prévient l'action (on attend un nombre)
    else if (calculatorData.calculation.slice(-1).match(/[-]/) && calculatorData.calculation.length === 1) return;
    // Sinon tout est ok, on ajoute l'opérateur à la suite
    else {
        calculatorData.calculation += buttonValue;
        resultDisplay.textContent = calculatorData.calculation;
    }
}


// On gère les nombres décimaux
const decimalButton = document.querySelector("[data-action='.']")

decimalButton.addEventListener("click", handleDecimal);

function handleDecimal (){

    // S'il n'y a pas de calcul en cours, on ne peut pas commencer par un .
    if (!calculatorData.calculation) return;
  
    let lastSetOfNumbers = "";
  
    // On décrémente jusqu'à trouver un éventuel opérateur
    for (let i = calculatorData.calculation.length - 1; i >= 0 ; i--) {

        // Si c'est le cas, on quitte la boucle
        if(/[\/+*-]/.test(calculatorData.calculation[i])){
            break;
        }
        // Sinon, on ajoute tous les caractères à notre string à vérifier
        else {
            lastSetOfNumbers += calculatorData.calculation[i];
        }
    }
    
    // Si notre string à vérifier ne contient pas déjà de .
    if (!lastSetOfNumbers.includes(".")) {

        // On ajoute bien le . à la suite
        calculatorData.calculation += ".";
        resultDisplay.textContent = calculatorData.calculation;
    }
}


// On gère le bouton égal (résultat)
const equalBtn = document.querySelector("[data-action='=']");

equalBtn.addEventListener("click", handleEqualBtn);

function handleEqualBtn() {

    // Si, au click sur le bouton = , le dernier caractère est un opérateur
    if (/[\/+*-.]/.test(calculatorData.calculation.slice(-1))) {
        // On affiche un message d'erreur pendant 2,5s
        calculationDisplay.textContent = "Terminez le calcul par un chiffre.";
        setTimeout(() => {
            calculationDisplay.textContent = "";
        }, 2500);
        return;
    }
    // Si il n'y a pas déjà de résultat en cours
    else if (!calculatorData.displayedResults) {
        calculatorData.result = customEval(calculatorData.calculation);
        // On affiche le résultat
        resultDisplay.textContent = calculatorData.result;
        // Et on affiche le calcul
        calculationDisplay.textContent = calculatorData.calculation;
        calculatorData.displayedResults = true;
    }
}


// Fonction qui remplace la fonction js eval() (non sécurisée), et donc qui recherche tous les opérateurs présents dans le calcul et vérifie leur ordre d'attribution avant d'effectuer l'opération (le * passe avant le +, par exemple)
function customEval(calculation) {

    // S'il n'y a pas d'opérateur à part le premier caractère (qui peut être un moins)
    if (!/[\/+*-]/.test(calculation.slice(1))) return calculation;

    let operator;
    let operatorIndex;

    // On recherche en premier la précédence des divisions et multiplications (on slice à 1 car on ne vérifie pas le 1er caractère)
    if (/[\/*]/.test(calculation.slice(1))) {

        for (let i = 1 ; i < calculation.length ; i++) {

            // On boucle sur tous les caractères, et si l'un d'entre-eux est un * ou un /
            if (/[\/*]/.test(calculation[i])) {

                // On le stocke et on stocke sa position en variables, et on sort de la boucle
                operator = calculation[i];
                operatorIndex = i;
                break;
            }
        }
    }
    // Dans le cas où il n'y a pas de * ou de /
    else {

        for (let i = 1 ; i < calculation.length ; i++) {

            // On boucle sur tous les caractères, et si l'un d'entre-eux est un + ou un -
            if (/[+-]/.test(calculation[i])) {

                // On le stocke et on stocke sa position en variables, et on sort de la boucle
                operator = calculation[i];
                operatorIndex = i;
                break;
            }
        }
    }

    // On lance la fonction getIndexes() avec l'opérateur rencontré pour récupérer les données à calculer (renvoyées sous forme d'objet)
    const operandsInfo = getIndexes(operatorIndex, calculation);

    let currentCalculationResult;

    // Et on switch en fonction de l'opérateur
    switch (operator) {

        // Si c'est un +, on additionne le nombre de droite et celui de gauche (Number() sert à transformer la string en nombre)
        case "+":
            currentCalculationResult = Number(operandsInfo.leftOperand) + Number(operandsInfo.rightOperand);
            break;

        // Si c'est un -, on soustrait le nombre de droite et celui de gauche
        case "-":
            currentCalculationResult = Number(operandsInfo.leftOperand) - Number(operandsInfo.rightOperand);
            break;

        // Si c'est un *, on multiplie le nombre de droite par celui de gauche
        case "*":
            currentCalculationResult = Number(operandsInfo.leftOperand) * Number(operandsInfo.rightOperand);
            break;

        // Si c'est un /, on divise le nombre de droite par celui de gauche
        case "/":
            currentCalculationResult = Number(operandsInfo.leftOperand) / Number(operandsInfo.rightOperand);
            break;
        
    }

    // On utilise la fonction replace() qui permet de modifier le contenu d'une string , et on remplace tout le contenu de notre opération (entre l'opérateur de gauche et celui de droite) par le résultat de notre opération
    let updatedCalculation = calculation.replace(calculation.slice(operandsInfo.startIntervalIndex, operandsInfo.lastRightOperandCharacter), currentCalculationResult.toString());


    // Récursion de la fonction, tant qu'il reste des opérateurs dans le résultat (en dehors de l'éventuel - en premier pour les nombres négatifs)
    if (/[\/+*-]/.test(updatedCalculation.slice(1))) {
        customEval(updatedCalculation);
    }


    // S'il y a un nombre à virgules, on va gérer ce qu'il y a après la virgule
    if (updatedCalculation.includes(".")) {

        // On transforme notre élément en tableau à partir du . , on prend le [1] donc la partie après la virgule , et on vérifie combien de caractères on a :

        // Si on a 1 seul caractère après la virgule
        if (updatedCalculation.split(".")[1].length === 1) {
            return Number(updatedCalculation).toString();
        }
        // Si il y a plus d'un chiffre après la virgule, on limite à 2
        else if (updatedCalculation.split(".")[1].length > 1) {
            return Number(updatedCalculation).toFixed(2).toString();
        }
    }
    else {
        return updatedCalculation;
    }

}

// Fonction pour retourner les nombres à gauche et à droite de l'opérateur rencontré
function getIndexes(operatorIndex, calculation) {

    // On récupère le nombre à droite de l'opérateur qu'on a rencontré
    let rightOperand = "";
    let lastRightOperandCharacter;

    for (let i = operatorIndex + 1 ; i <= calculation.length ; i++) {
        // Si on arrive à la fin du calcul, on définit la fin de l'opérateur de droite à la fin de la string
        if (i === calculation.length) {
            lastRightOperandCharacter = calculation.length;
            break;
        }
        // Si on rencontre un nouvel opérateur dans la chaîne, on définit immédiatement la fin de l'opérateur de droite
        else if (/[\/+*-]/.test(calculation[i])) {
            lastRightOperandCharacter = i;
            break;
        }
        // Sinon tant qu'on rencontre une suite de chiffres, on continue de les enregistrer dans l'opérateur de droite
        else {
            rightOperand += calculation[i];
        }
    }

    // On récupère également le nombre à gauche de l'opérateur qu'on a rencontré
    let leftOperand = "";
    let startIntervalIndex;

    for (let i = operatorIndex - 1 ; i >= 0 ; i--) {

        // Si on arrive au début de notre string et qu'on rencontre un moins, on l'ajoute à notre opérateur de gauche (opérateur négatif)
        if (i === 0 && /[-]/.test(calculation[i])) {
            startIntervalIndex = 0;
            leftOperand += "-";
            break;
        }
        // Si on arrive au début de notre string et que ce n'est pas un nombre négatif, on ajoute le caractère et on break
        else if (i===0) {
            startIntervalIndex = 0;
            leftOperand += calculation[i];
            break;
        }
        // Si on rencontre un nouvel opérateur dans la chaîne, on définit immédiatement la fin de l'opérateur de gauche
        else if (/[\/+*-]/.test(calculation[i])) {
            startIntervalIndex = i + 1;
            break;
        }
        // Sinon tant qu'on rencontre une suite de chiffres, on continue de les enregistrer dans l'opérateur de gauche
        else {
            leftOperand += calculation[i];
        }
    }

    /* 
        Vu qu'on a décrémenté, on va retourner la string leftOperand pour la remettre à l'endroit :
        .split("") pour la transformer en tableau
        .reverse() pour le remettre à l'endroit
        .join("") pour remettre le tableau en chaîne de caractères
    */
    leftOperand = leftOperand.split("").reverse().join("");

    // On retourne un nouvel objet avec des propriétés (leftOperand : leftOperand, etc..) car le nom de la propriété a la même valeur que la variable
    return {
        leftOperand,
        rightOperand,
        startIntervalIndex,
        lastRightOperandCharacter
    }

}


// On crée la fonction reset() de la calculatrice au click sur C
const resetButton = document.querySelector('[data-action="c"]');

resetButton.addEventListener('click', reset);

function reset() {
    calculatorData.calculation = "";
    calculatorData.displayedResults = false;
    calculatorData.result = "";
    resultDisplay.textContent = "0";
    calculationDisplay.textContent = "";
}


// On crée la fonction clearEntry() pour retirer le dernier caractère au click sur CE
const clearEntryButton = document.querySelector('[data-action="ce"]');

clearEntryButton.addEventListener('click', clearEntry);

function clearEntry() {

    // Si nous affichons un résultat, il n'y a rien à retirer
    if (!calculatorData.displayedResults) {

        // Si nous sommes au départ ou à 0, il n'y a rien à retirer non plus
        if (resultDisplay.textContent[0] === "0") return;
        // S'il n'y a qu'un seul caractère, on renvoie 0
        else if (resultDisplay.textContent.length === 1) {
            calculatorData.calculation = "0";
        }
        // Sinon on retire bien le dernier caractère
        else {
            calculatorData.calculation = calculatorData.calculation.slice(0, -1);
        }

        resultDisplay.textContent = calculatorData.calculation;
    }

}


