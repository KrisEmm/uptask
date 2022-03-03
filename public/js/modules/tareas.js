import Swal from "sweetalert2";
import Axios from "axios";
import { actualizarAvance } from "../functiones/avance";

const tareas = document.querySelector(".listado-pendientes");

if (tareas) {
  tareas.addEventListener("click", event => {
    if (event.target.classList.contains("fa-check-circle")) {
      const icono = event.target;
      const idTarea = icono.parentElement.parentElement.dataset.tarea;
      const url = `${location.origin}/tareas/${idTarea}`;
      Axios.patch(url, { idTarea }).then(function(respuesta) {
        if (respuesta.status === 200) {
          icono.classList.toggle("completo");
          actualizarAvance();
        }
      });
    }
    if (event.target.classList.contains("fa-trash")) {
      const tareaHTML = event.target.parentElement.parentElement;
      const idTarea = tareaHTML.dataset.tarea;

      //
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
          const url = `${location.origin}/tareas/${idTarea}`;
          Axios.delete(url, { params: { idTarea } }).then(function(respuesta) {
            if (respuesta.status === 200) {
              tareaHTML.parentElement.removeChild(tareaHTML);
              Swal.fire("Deleted!", respuesta.data, "success");
              actualizarAvance();
            }
          });
        }
      });
      //
    }
  });
}
export default tareas;
