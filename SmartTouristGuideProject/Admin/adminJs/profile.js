document.addEventListener("DOMContentLoaded",()=>{

const form=document.getElementById("profileForm");

const fullName=document.getElementById("fullName");
const email=document.getElementById("email");
const username=document.getElementById("username");
const phone=document.getElementById("phone");
const password=document.getElementById("password");
const confirmPassword=document.getElementById("confirmPassword");

const adminName=document.getElementById("adminName");
const quickCards=document.querySelectorAll(".quick-card");

form.addEventListener("submit",e=>{

e.preventDefault();

if(fullName.value.trim()===""){

alert("Full Name is required.");
return;

}

if(email.value.trim()===""){

alert("Email Address is required.");
return;

}

if(username.value.trim()===""){

alert("Username is required.");
return;

}

if(phone.value.trim()===""){

alert("Phone Number is required.");
return;

}

if(password.value!==""||confirmPassword.value!==""){

if(password.value!==confirmPassword.value){

alert("Passwords do not match.");
return;

}

if(password.value.length<6){

alert("Password must contain at least 6 characters.");
return;

}

}

adminName.textContent=fullName.value;

alert("Profile updated successfully.");

});

quickCards.forEach(card=>{

card.addEventListener("click",()=>{

const title=card.querySelector("h3").textContent;

switch(title){

case "Edit Profile":

document.getElementById("fullName").focus();

break;

case "Change Password":

document.getElementById("password").focus();

break;

case "Export Profile":

exportProfile();

break;

case "Logout":

if(confirm("Are you sure you want to logout?")){

window.location.href="../html/login.html";

}

break;

}

});

});

function exportProfile(){

const profile={

name:fullName.value,
email:email.value,
username:username.value,
phone:phone.value

};

const blob=new Blob(

[JSON.stringify(profile,null,2)],

{type:"application/json"}

);

const url=URL.createObjectURL(blob);

const link=document.createElement("a");

link.href=url;

link.download="admin-profile.json";

link.click();

URL.revokeObjectURL(url);

}

setInterval(()=>{

const activity=document.querySelector(".activity-section");

if(activity){

const card=document.createElement("div");

card.className="activity-card";

card.innerHTML=`

<i class="fa-solid fa-user-clock"></i>

<p>Administrator session is active.</p>

<span>Just now</span>

`;

activity.appendChild(card);

const cards=document.querySelectorAll(".activity-card");

if(cards.length>6){

cards[0].remove();

}

}

},60000);

console.log("VISIT LANKA Admin Profile Loaded");

});