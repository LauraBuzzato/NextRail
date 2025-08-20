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

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('main');
    const menuLinks = document.querySelectorAll('.menu a.link');
    
    function highlightMenu() {
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        
        // Verifica se o topo da seção atingiu o topo da viewport
        if (pageYOffset >= (sectionTop - 1)) {
          current = section.getAttribute('id');
        }
      });
      
      menuLinks.forEach(link => {
        link.parentElement.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
          link.parentElement.classList.add('active');
        }
      });
    }
    
    window.addEventListener('scroll', highlightMenu);
    highlightMenu();
  });