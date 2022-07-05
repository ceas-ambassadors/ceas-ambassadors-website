'use strict';
let darkmode = localStorage.getItem("darkmode");
const darkmodetoggle = document.querySelector('icon'); 

const enabledarkmode = () =>{
    document.getElementById(pgstyl).setAttribute('href','/stylesheets/styledark.css');
}

const disabledarkmode = () =>{
    document.getElementById(pgstyl).setAttribute('href','/stylesheets/style.css');
}

darkmodetoggle.addEventListener('click', ()=>{
    console.log('plzwork')
});