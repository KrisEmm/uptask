import Swal from "sweetalert2";
import Axios from "axios";

const btnEliminar = document.querySelector("#eliminar-proyecto");

if (btnEliminar) {
  btnEliminar.addEventListener("click", event => {
    const urlProyecto = event.target.dataset.proyectoUrl;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(result => {
      if (result.value) {
        const url = `${location.origin}/proyectos/${urlProyecto}`;
        Axios.delete(url, { params: { urlProyecto } })
          .then(function(respuesta) {
            Swal.fire("Deleted!", respuesta.data, "success");
            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
          })
          .catch(() => {
            Swal.fire({
              type: "Error",
              title: "There is a error",
              text: "Do not deleted your proyect"
            });
          });
      }
    });
  });
}

export default btnEliminar;
