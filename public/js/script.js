/*Ativar o menu */

const menu = document.querySelector(".menu");
const linkItems = document.querySelectorAll(".link-item");

menu.addEventListener("mouseenter", () => {
  menu.classList.add("active");

});

menu.addEventListener("mouseleave", () => {
  menu.classList.remove("active");
});