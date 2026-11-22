"use strict";
// Array cu imaginile din folderul ../MEDIA
const images = [
  "../media/1.jpg", // Exemplu de imagine
  "../media/2.jpg", // Imaginea 2
  "../media/3.jpg", // Imaginea 3
  "../media/4.jpg"  // Imaginea 4
];
// Obtinem elementul principal din DOM
const mainImage = document.getElementById("carousel-image");
// Verificam daca elementul exista
if (!mainImage)
    throw new Error("Elementul cu ID-ul 'carousel-image' nu a fost gasit!");
let currentIndex = 0;
// Functie care schimba imaginea mare
function showNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    mainImage.src = images[currentIndex];
}
// Slider automat la 3 secunde (3000 milisecunde)
setInterval(showNextImage, 3000);
