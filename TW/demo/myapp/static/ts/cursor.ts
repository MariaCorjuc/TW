export {};

const cursor = document.createElement("div");

cursor.id = "cursor";

document.body.appendChild(cursor);

let hue = 0;

document.addEventListener("mousemove", (e: MouseEvent) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

function animateColor() {
  hue = (hue + 1) % 360;

  cursor.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

  cursor.style.boxShadow = `0 0 15px hsl(${hue}, 100%, 50%)`;

  requestAnimationFrame(animateColor);
}

animateColor();