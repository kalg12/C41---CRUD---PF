console.log("Hola");
localStorage.setItem("nombre", "Kevin");
localStorage.setItem("edad", "25");

const nombreGuardado = localStorage.getItem("nombre");
document.getElementById("nombre").innerHTML = `<h1>${nombreGuardado}</h1>`;

/* Función que cambia el valor del nombre */
const nuevoValor = () => {
  alert("El valor va a cambiar...");
  localStorage.setItem("nombre", "Roberto");
  const nombre = localStorage.getItem("nombre");
  console.log("El nuevo valor de la key es: " + nombre);
  const nombreGuardado = localStorage.getItem("nombre");
  document.getElementById("nombre").innerHTML = `<h1>${nombreGuardado}</h1>`;
};

const nuevoValorCarlos = () => {
  alert("El valor va a cambiar...");
  localStorage.setItem("nombre", "Carlos");
  const nombre = localStorage.getItem("nombre");
  console.log("El nuevo valor de la key es: " + nombre);
  const nombreGuardado = localStorage.getItem("nombre");
  document.getElementById("nombre").innerHTML = `<h1>${nombreGuardado}</h1>`;
};

/* Función para eliminar el valor del LS */
const eliminarTodo = () => {
  alert("Estas eliminando el valor de edad...");
  localStorage.removeItem("edad");
  const nombreGuardado = localStorage.getItem("nombre");
  document.getElementById("nombre").innerHTML = `<h1>${nombreGuardado}</h1>`;
};

/* Función que elimina todos de mi localStorage */
const eliminacionDeTodo = () => {
  alert("Estás eliminando todo de tu localStorage");
  localStorage.clear();
  const nombreGuardado = localStorage.getItem("nombre");
  document.getElementById("nombre").innerHTML = `<h1>${nombreGuardado}</h1>`;
};

/* Para recuperar la información puedo poner la palabra get */
const nombre = localStorage.getItem("nombre");
console.log("El valor de la key es: " + nombre);
