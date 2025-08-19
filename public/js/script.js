/*Ativar o menu muhehehhehe */

const menu = document.querySelector(".menu");
const linkItems = document.querySelectorAll(".link-item");
// const darkMode = document.querySelector(".modo-escuro");

menu.addEventListener("mouseenter", () => {
  menu.classList.add("active");

});

menu.addEventListener("mouseleave", () => {
  menu.classList.remove("active");
});

