// ========================= DEPENDENCIAS ===============================
const prompt = require('prompt-sync')();

// ======================================================================

// ====================== GLOBAL VARIABLES ==============================
var lowestGrade = 1000;     // Nota a ser substituída pela recuperação, se necessário
var grades = [0,0,0];       // Notas do aluno
var numSubjects = 1;        // Número de matérias do aluno


// ======================================================================

// ======================== CONSTANTES ===================================
const cutoffGrades = 6;     // Nota de corte para aprovaçãp
const cutoffAbsenses = 5;   // Nota de corte para faltas
const numGrades = 3;        // Numero de provas por materia

// ======================================================================


// ========================= FUNÇÃO MAIN ================================
// Apenas uma função para sequenciar e organizar o código;. Ela é chamada no final do programa
function main(){
    console.log("Hello student. Let's register with your infos: ")
    createStudent();
    //console.log(addSubjects());
    console.log("Program has finished.")
}

// ======================================================================

// ======================== GET and SET FUNCTIONS =========================
// Função para receber algum valor do usuário, sem validação de dados
function getUserInput(msg, typeValue){ 
    let userInput;
    if(typeValue == "string"){                      // Para valores tipo "string"
        userInput = prompt(`${msg}: `);             
    }else {                                         // Para valores diferentes de "string", tipo número
        userInput = (+prompt(`${msg}: `));
    }

    return userInput;
}

// Função para receber o nome do aluno, com validação de dados
function getName(){                                
    let name = getUserInput("Type your name", "string");
    return validateValue(name, "string");
}

// Função para receber o número de faltas do aluno na matéria, com validação de dados
function getNumAbsense(nameSubject){
    let absense = getUserInput(`Type the number of absenses in ${nameSubject}`, "number");
    return validateValue(absense, "number");
}

// Função para receber a referida nota do aluno (pode ser a 1ª, 2ª, etc ou sem indice, por isso a variável index), com validação de dados
// A nota vai de 0 a 10, então ela não pode ser menor que 0 (algo ja validado pela função validateValue()) e nem maior que 10
// A validação se a nota é maior que 10 acontece aqui pois a função validateValue é usada em outras partes do código, afinal o aluno pode ter mais de 10 matéris ou 10 faltas

/**OBS: sobre o uso de recursividade nessa função
 * A restrição do valor fornecido pelo usuario ser maior que 10 é somente para as notas. Porém, havia uma forma de burlar isso.
 * Se o usuário digitasse um valor inválido (negativo ou não númerico), ia entrar no caso de validação, através da função validateValue, no retorno dessa função.
 * Porem, se dentro da validação em validateValue, o usuário digitasse um valor maior que 10, o programaria entenderia esse valor como um valor válido,
 * afinal, 10 é um número positivo. E, dessa forma, ele conseguiria cadastrar uma nota maior que 10
 * Para resolver isso, foi necessário utilizar recursividade da função getGrade()
 * Se a nota fornecida, dentro da validação, for maior que 10, a função getGrade() será chamada novamente e esse loop continuará até que uma nota válida (numérica, positica e até 10)
 * seja fornecida.
 * Assim, o problema descrito anteriormente é corrigido e evita-se complicações futuras (e estranhas) no calculo da média e afins
 * 
 */
function getGrade(index) {
    let grade;                                      // Iniciando a variavel em um valor maior que 10 para que a recursividade funcione corretamente. Ver a obs no comentário acima

    do{
        if(grade > 10) {
            console.log("The grade couldn't be more than 10. Please, try again"); // Aparece a mensagem de erro somente se a nota fornecida for maior que 10 
        }
        if(index < 0){
            grade = getUserInput("Type the grade", "number");
        }
        else{
            grade = getUserInput(`${index} - Type the grade`, "number");
        }

    }while( grade > 10);

    validateGrade = validateValue(grade, "number");

    if(validateGrade > 10) {
        getGrade(-1);                    //Ver a obs no comentário logo acima da função
    }
    return validateGrade;
}

//Função para armazenar as notas do aluno, pra ser usada posteriormente
function setGrades(){
    for(let i = 0; i < numGrades; i++){
        grades[i] = getGrade(i+1);
    }
}

// ==========================================================================================

// ============================= COMPUTE_VALUES FUNCTIONS ===================================
// Função para calcular a média do aluno por materia, com validação de dados
function computeAverage(){
    let sum = 0;
    grades.forEach((value) => {                                 // Soma todas as notas e pega a menor delas
        sum += value;
        if(lowestGrade > value) lowestGrade = value;
    });

    let average = parseFloat((sum/numGrades).toFixed(2));       //Calcula a média
    return  average;
}

// Função para calcular, se necessário, a recuperação e a nova média do aluno
/** OBS: Sobre a recuperação nesse sistema
 *  O aluno tem suas 3 notas computadas e caso a média seja insuficente para aprovação (average < 6), o aluno tem direito a fazer a recuperação (reposição)
 *  da sua menor nota e assim, substitui-la, caso a nota recuperada seja maior que a nota original.
 *  Depois, é calculada novamente a média do aluno, com a nota de recuperação (se for maior que a original) e as duas outras
 *  Após isso, a media do aluno é analisada para saber o estado do aluno na materia que está sendo registrada (se foi aprovado, etc)
 */
function computeRecovery(average){
    if(average >= cutoffGrades){                                                //Se a média é maior que 6, o aluno não precisa fazer recuperação
        return -1;
    }else{
        console.log("You got low score. You should do another exame to replace your lowest grade: ", + lowestGrade);
        console.log("Let's get your recovery grade. ");
        let recoveryGrade = getGrade(-1);                                       // Recebendo a nota de recuperação. Nesse caso, não se precisa de indice, por isso o valor (-1)

        for(let i = 0; i < numGrades; i++){
            if((grades[i] == lowestGrade) && (grades[i] < recoveryGrade)){      // Verificando qual é a menor nota do aluno e, se a nota for menor que a nota de recuperação,   
                grades[i] = recoveryGrade;                                      // substituindo ela pela nota de recuperação. 
            }
        }

        let newAverage = computeAverage();                                      // Recalculando o valor da média, com a nova nota de recuperação (se houve substituição da nota,
        console.log("New average: " + newAverage);                              // a nova média irá aumentar)
        return newAverage;
    }
}

// Função para verificar se o aluno foi ou não aprovado na materia
function computeStateStudent(recovery, absense){
    if(absense > cutoffAbsenses){                                       // Se faltar mais de 5 vezes na materia, o aluno está automaticamente reprovado por falta
        return "Reproved by absense";
    }
    else{
        if(recovery > cutoffGrades){                                    // Se, após a recuperação, a nova média for maior que 6, o aluno é aprovado por recuperação
            return "Approved by recovery";
        }else if((recovery >= 0) && (recovery < cutoffGrades)){         // Se, após a recuperação, a nova média for menor que 6, o aluno é reprovado por nota insuficiente
            return "Repproved by insuficent score";
        }
        else{                                                           // Na função computeRecovery(), se a média inicial do aluno for suficiente, ele não precisa de recuperação.
            return "Approved";                                          // Logo, ele é automaticamente aprovado. Nesse caso, valor da recuperação é -1,  para validar esse caso.
        }
    }
}
// =============================================================================


// ================================== CREATE FUNCTIONS ====================================
//Função para registrar uma nova máteria do aluno, com validação de dados

/** Sobre essa função: 
 * Recebe os valores de 
 *     - nome da materia (nameSubject);
 *     - média (average);
 *     - recuperação (recovery);
 *     - número de faltas (absense);
 *     - Status do aluno (stateStudent)
 * 
 * Faz o cálculo da média do aluno (setGrades())
 * Faz o cálculo da recuperação (computeRecovery())
 * Faz a troca do valor da média, caso o aluno tenha feito a recuperação. 
 * Faz a verificação se o aluno esta ou não aprovado na materia (computeStateStudent())
 */
function createSubject(){
    let subject = new Object();

    let nameSubject = validateValue(prompt("Type the name of the subject: "), "string");

    console.log("\nLet's compute your average. Type the your grades: ");
    setGrades();
    let average = computeAverage();
    console.log("\nYour average is: " + average+"\n");
    let recovery = computeRecovery(average);
    let absense = getNumAbsense(nameSubject);
    let stateStudent = computeStateStudent(recovery, absense);

    subject['name'] = nameSubject;
    subject['average'] = (recovery < 0) ? average : recovery;   // Se ela ficou de recuperaçao, sua média é a nova media calculada após a prova de recuperação
    subject['absense'] = absense;
    subject['state'] = stateStudent;

    console.log(stateStudent);
    console.log("-----------------");

    return subject;                                             // Retorna a nova matéria cadastrada
}

//Função para cadastrar as matérias do aluno, sendo no minimo 3 e continuando até que o aluno deseje continuar.
function addSubjects(){
    let subjects = [];                                                                              // Lista que irá conter todas as matérias cadastradas
    let newSubject;
    let numSubjects = 1;
    let userInput = "";
    do{
        console.log(`\nAdd new subject (${numSubjects}): `);
        newSubject = createSubject();
        subjects.push(newSubject);                                                                  // Adicionando a nova materia cadastrada na lista

        userInput = getUserInput("Do you want to continue? (y to YES or any other value to NO)", "string").toUpperCase();   // Verificando se o aluno deseja cadastrar mais matérias
        if(userInput == "Y"){
            console.log("Ok. Let's continue.")
        }
        else {
            if(numSubjects < 3){                                                                    // O aluno deve cadastrar no minimo 3 matérias
                console.log("You must have at least 3 subjects. Let's continue. "); 
            }else{
                console.log("Ok. Registered subjects.")
                break;
            }
        }
        numSubjects++;
    }while(true);

    console.log("----------------------");

    return subjects;                                                                                //Retornando uma lista com todas as matérias cadastradas
}

//Função para cadastrar o estudante e a principal função do programa, em que de fato irá registrar as informações do aluno e exibi-las no console
// Essa função recebe o nome do aluno e as materias por ele cadastradas e no final exibe essas informações
// Essa função pode ser modificadda para retornar um aluno com todas as suas informações (e outras, se for preciso acrescentar), addicionado um "return student" no fim da funçãp
// Assim, pode-se cadastrar vários estudantes e salva-los em uma lista e etc.
function createStudent(){
    let student = new Object();
    student['name'] = getName();
    console.log("Lets add your subjects. ");
    student['subjects'] = addSubjects();

    console.log("\n ----------------------------------------- \n");

    console.log("Registered student:");

    console.log("Name: "+ student['name']);
    console.log("Subjects: ");
    student['subjects'].forEach((value) =>{
        console.log(value);
    });

    console.log("\n ----------------------------------------- \n");
}

// =============================================================================

// ========================== VALIDATE FUNCTIONS ===============================
// Função para verificar se um valor dado é um número e se é um numero positivo
function validateNumber(value){
    let isNumber = (!isNaN(value));
    let isPositive = (value >= 0);

    if(isNumber && isPositive){
        return value;
    }
    else {
        return -1;  //retorna -1 caso o valor não seja um numero ou seja um numero negativo
    }   
}

// Função para verificar se um valor não é um número, ou seja, uma string (Tive que me restringir a somente essas duas possibilidades)
function validateString(value){
    let isString = isNaN(value); //Se não é um numero, é uma string
    
    return ( (isString) ? value : -1 ); //retorna -1 caso o valor seja um número
}

// Função para verificar se um valor é um número ou uma string, a depender do desejado
// Essa função é um compilado das outras duas funções anteriores, para facilitar o uso.
// Além disso, a função continua até que seja fornecido um valor valido, sem que o código quebre
function validateValue(value, typeValue){
    if(typeValue == "number"){
        while(validateNumber(value) < 0){                                           //Enquanto o valor fornedcido não for um número, continuar a pedir um novo valor
            console.log("\nThis value is a invalid number. Please, try again.");
            value = getUserInput("Type a new value: ", typeValue);
        }
    }
    else if(typeValue == "string"){
        while(validateString(value) < 0){                                           //Enquanto o valor fornedcido não for uma string, continuar a pedir um novo valor
            console.log("\nThis value is a invalid string. Please, try again.");        
            value = getUserInput("Type a new value: ", typeValue);
        }
    }
    else {
        //Espaço para, futuramente se preciso, validar outros possíveis tipos de valores
    }
    return value;
}

// ========================== TEST FUNCTIONS ===============================
//Função para mostrar uma mensagem e um valor desejado. Apenas para testes
function debug(msg, value){
    console.log(msg + ": " + value);
}

// =============================================================================

main(); // Chamada da função main para execução do programa.