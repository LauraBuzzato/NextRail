/*Ativar o menu */

const menu = document.querySelector(".menu");
const linkItems = document.querySelectorAll(".link-item");

menu.addEventListener("mouseenter", () => {
  menu.classList.add("active");

});

menu.addEventListener("mouseleave", () => {
  menu.classList.remove("active");
});


const hamburger = document.getElementById('hamburger');
const menuH = document.querySelector('.menu');
const main = document.querySelector('main');

hamburger.addEventListener('click', () => {
  menuH.classList.toggle('active');
  hamburger.classList.toggle('active');
  main.classList.toggle('shifted');
});
