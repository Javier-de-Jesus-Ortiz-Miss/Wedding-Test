const weddingDate = new Date('2025-05-16T17:00:00').getTime();

const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;

    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('days').innerText = '0';
        document.getElementById('hours').innerText = '0';
        document.getElementById('minutes').innerText = '0';
        document.getElementById('seconds').innerText = '0';
    }
}, 1000);

const apiUrlGet = 'https://script.google.com/macros/s/AKfycbysMvujvf_5VAF5331L8oclOC3-2C8TUS9QvRsA1HWIFk2DqDU3Dw3Bjg1vB9DoswfU/exec';
const apiUrlPost = 'https://script.google.com/macros/s/AKfycbzQ1lArT83x0sOn51eX-FCywOimJjcpSXzrjwXBAAoNGBN6Q3xC72Ee14EdalZbL8Ps/exec';
let guestData = {};

// Obtener datos desde el Apps Script (doGet)
async function loadGuestData() {
  try {
    const response = await fetch(apiUrlGet);
    guestData = await response.json();
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    alert('Error al cargar la lista de invitados.');
  }
}

// Verificar número de teléfono y mostrar invitados
async function verifyPhone() {
    const phone = document.getElementById('phone').value;
    const guestListDiv = document.getElementById('guest-list');
    const invitationSection = document.getElementById('invitation-section');
    const commentSection = document.getElementById('comment-section');
    const submitBtn = document.getElementById('submit-btn');
  
    if (guestData[phone]) {
      const guests = guestData[phone];
  
      // Limpiar invitados previos
      guestListDiv.innerHTML = '';
  
      guests.forEach(guest => {
        const wrapper = document.createElement('div');
        wrapper.className = 'guest-item'; // Clase para el estilo del contenedor
  
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = guest;
        checkbox.id = guest;
        checkbox.name = 'guests';
        checkbox.className = 'guest-checkbox'; // Clase para el estilo del checkbox
  
        const label = document.createElement('label');
        label.htmlFor = guest;
        label.textContent = guest;
        label.className = 'guest-label'; // Clase para el estilo del label
  
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        guestListDiv.appendChild(wrapper);
      });
  
      invitationSection.style.display = 'block';
      commentSection.style.display = 'block';
      submitBtn.style.display = 'block';

      // Manejar el checkbox "No asistiré"
      document.getElementById('not-attending').addEventListener('change', function () {
          const guestCheckboxes = document.querySelectorAll('input[name="guests"]');
          if (this.checked) {
              // Desmarcar y deshabilitar todos los checkboxes de la lista de invitados
              guestCheckboxes.forEach(checkbox => {
                  checkbox.checked = false; // Desmarcar
                  checkbox.disabled = true; // Deshabilitar
                  checkbox.style.opacity = "0.5"; // Aplica el estilo directamente
                  checkbox.style.cursor = "not-allowed";
              });
          } else {
              // Habilitar todos los checkboxes de la lista de invitados
              guestCheckboxes.forEach(checkbox => {
                  checkbox.disabled = false;
                  checkbox.style.opacity = "1"; // Restaurar estilo
                  checkbox.style.cursor = "pointer";
              });
          }
      });
    
    } else {
      alert('Número no encontrado.');
    }
  }

// Enviar datos al Apps Script (doPost)
async function submitForm() {
  const phone = document.getElementById('phone').value;
  const comment = document.getElementById('comment').value;

  // Recopilar nombres seleccionados
  const selectedGuests = Array.from(document.querySelectorAll('input[name="guests"]:checked'))
                              .map(checkbox => checkbox.value);
    if (!phone || (selectedGuests.length === 0 && !document.getElementById('not-attending').checked)) {
    alert('Por favor, complete los datos del formulario antes de confirmar la asistencia.');
    return;
  }

  const confirmedCount = selectedGuests.length > 0 ? selectedGuests.length : "Sin asistencias";

  const data = {
    phone,
    selectedGuests,
    confirmedCount,
    comment
  };

  try {
    await fetch(apiUrlPost, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    alert('Asistencia confirmada correctamente.');
    resetForm();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al enviar la confirmación.');
  }
}

function resetForm() {
  document.getElementById('phone').value = '';
  document.getElementById('guest-list').innerHTML = '';
  document.getElementById('comment').value = '';

  document.getElementById('invitation-section').style.display = 'none';
  document.getElementById('comment-section').style.display = 'none';
  document.getElementById('submit-btn').style.display = 'none';

  const notAttendingCheckbox = document.getElementById('not-attending');
  if (notAttendingCheckbox) {
    notAttendingCheckbox.checked = false;
  }
}

loadGuestData();