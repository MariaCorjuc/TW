
"use strict";

const images = [
    "/static/media/1.jpg",
    "/static/media/2.jpg",
    "/static/media/3.jpg",
    "/static/media/4.jpg"
];

const mainImage = document.getElementById("carousel-image");

if (!mainImage)
    throw new Error("Elementul cu ID-ul 'carousel-image' nu a fost gasit!");

let currentIndex = 0;

function showNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    mainImage.src = images[currentIndex];
}

setInterval(showNextImage, 3000);
