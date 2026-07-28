// =====================================
// LOAD QUESTIONNAIRE DATA
// =====================================

const questionnaireData = JSON.parse(
    localStorage.getItem("questionnaireData")
);

console.log(questionnaireData);

// ==========================================
// VISIT LANKA QUESTIONNAIRE
// ==========================================

// Questions
const questions = document.querySelectorAll(".question");

// Navigation
const nextBtn = document.getElementById("nextBtn");
const previousBtn = document.getElementById("previousBtn");

// Progress
const progressFill = document.getElementById("progressFill");
const currentStep = document.getElementById("currentStep");

// Current Question
let currentQuestion = 0;

// ==========================================
// STORE ALL USER ANSWERS
// ==========================================

let questionnaireData = {

    destination: [],

    companion: "",

    budget: "",

    activities: [],

    duration: ""

};

// ==========================================
// SHOW QUESTION
// ==========================================

function showQuestion(index){

    questions.forEach((question,i)=>{

        if(i===index){

            question.classList.add("active");

        }

        else{

            question.classList.remove("active");

        }

    });

    currentStep.textContent=index+1;

    progressFill.style.width=((index+1)/questions.length)*100+"%";

    previousBtn.disabled=(index===0);

    validateQuestion();

}

// ==========================================
// CARD SELECTION
// ==========================================

const optionCards=document.querySelectorAll(".option-card");

optionCards.forEach(card=>{

    card.addEventListener("click",()=>{

        const questionType=card.dataset.question;

        const value=card.dataset.value;

        // ==========================
        // MULTIPLE SELECT
        // ==========================

        if(questionType==="destination" || questionType==="activities"){

            if(card.classList.contains("selected")){

                card.classList.remove("selected");

                questionnaireData[questionType]=
                questionnaireData[questionType].filter(item=>item!==value);

            }

            else{

                card.classList.add("selected");

                questionnaireData[questionType].push(value);

            }

        }

        // ==========================
        // SINGLE SELECT
        // ==========================

        else{

            document
            .querySelectorAll(
                `.option-card[data-question="${questionType}"]`
            )
            .forEach(c=>c.classList.remove("selected"));

            card.classList.add("selected");

            questionnaireData[questionType]=value;

        }
            updateButtons();

            validateQuestion();
        

    });

});

// ==========================================
// VALIDATE CURRENT QUESTION
// ==========================================

function validateQuestion(){

    let valid=false;

    switch(currentQuestion){

        // Question 1
        case 0:
            valid=questionnaireData.destination.length>0;
            break;

        // Question 2
        case 1:
            valid=questionnaireData.companion!=="";
            break;

        // Question 3
        case 2:
            valid=questionnaireData.budget!=="";
            break;

        // Question 4
        case 3:
            valid=questionnaireData.activities.length>0;
            break;

        // Question 5
        case 4:
            valid=questionnaireData.duration!=="";
            break;

    }

    nextBtn.disabled=!valid;

}

// ==========================================
// NEXT BUTTON
// ==========================================

nextBtn.addEventListener("click",()=>{

    if(currentQuestion<questions.length-1){

        currentQuestion++;

        showQuestion(currentQuestion);

    }

    else{

        finishQuestionnaire();

    }

});

// ==========================================
// PREVIOUS BUTTON
// ==========================================

previousBtn.addEventListener("click",()=>{

    if(currentQuestion>0){

        currentQuestion--;

        showQuestion(currentQuestion);

    }

});

// ==========================================
// CHANGE BUTTON TEXT
// ==========================================

function updateButtons(){

    if(currentQuestion===questions.length-1){

        nextBtn.innerHTML=
        'Finish <i class="fa-solid fa-check"></i>';

    }

    else{

        nextBtn.innerHTML=
        'Next <i class="fa-solid fa-arrow-right"></i>';

    }

}

// ==========================================
// FINISH QUESTIONNAIRE
// ==========================================

function finishQuestionnaire(){

    // Save all answers

    localStorage.setItem(

        "questionnaireData",

        JSON.stringify(questionnaireData)

    );

    // Redirect to recommendation page

    window.location.href="destinations.html";

}

// ==========================================
// LOAD PREVIOUS ANSWERS
// ==========================================

function loadPreviousAnswers(){

    const savedData=localStorage.getItem("questionnaireData");

    if(!savedData){

        return;

    }

    questionnaireData=JSON.parse(savedData);

    // Destination

    questionnaireData.destination.forEach(value=>{

        const card=document.querySelector(

            `.option-card[data-question="destination"][data-value="${value}"]`

        );

        if(card){

            card.classList.add("selected");

        }

    });

    // Companion

    if(questionnaireData.companion){

        const card=document.querySelector(

            `.option-card[data-question="companion"][data-value="${questionnaireData.companion}"]`

        );

        if(card){

            card.classList.add("selected");

        }

    }

    // Budget

    if(questionnaireData.budget){

        const card=document.querySelector(

            `.option-card[data-question="budget"][data-value="${questionnaireData.budget}"]`

        );

        if(card){

            card.classList.add("selected");

        }

    }

    // Activities

    questionnaireData.activities.forEach(value=>{

        const card=document.querySelector(

            `.option-card[data-question="activities"][data-value="${value}"]`

        );

        if(card){

            card.classList.add("selected");

        }

    });

    // Duration

    if(questionnaireData.duration){

        const card=document.querySelector(

            `.option-card[data-question="duration"][data-value="${questionnaireData.duration}"]`

        );

        if(card){

            card.classList.add("selected");

        }

    };

}

// ==========================================
// START QUESTIONNAIRE
// ==========================================

loadPreviousAnswers();

showQuestion(currentQuestion);