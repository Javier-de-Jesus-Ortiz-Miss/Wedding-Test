const weddingDate = new Date('2025-05-16T17:30:00').getTime();

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
  }
}

function showModalAlert(message) {
    const modal = document.createElement('div');
    modal.id = 'custom-alert-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <button id="close-modal-btn">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
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
      showModalAlert('Número no encontrado.');
    }
  }

// Enviar datos al Apps Script (doPost)
async function submitForm() {
  const phone = document.getElementById('phone').value;
  const comment = document.getElementById('comment').value;

  // Mostrar animación de carga
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(loadingOverlay);

  // Recopilar nombres seleccionados
  const selectedGuests = Array.from(document.querySelectorAll('input[name="guests"]:checked'))
                              .map(checkbox => checkbox.value);
  if (!phone || (selectedGuests.length === 0 && !document.getElementById('not-attending').checked)) {
    showModalAlert('Por favor, complete los datos del formulario antes de confirmar la asistencia.');
    document.body.removeChild(loadingOverlay); // Ocultar animación de carga
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

    showModalAlert('Asistencia confirmada correctamente.');
    resetForm();
  } catch (error) {
    console.error('Error:', error);
    showModalAlert('Error al enviar la confirmación.');
  } finally {
    document.body.removeChild(loadingOverlay); // Ocultar animación de carga
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


function handleScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  const windowHeight = window.innerHeight;

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < windowHeight - 100) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', handleScrollAnimations);
window.addEventListener('load', handleScrollAnimations);

function createParticles() {
    const particlesContainer = document.getElementById('particles-container');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        particlesContainer.appendChild(particle);
    }
}

function removeParticles() {
    const particlesContainer = document.getElementById('particles-container');
    particlesContainer.innerHTML = ''; // Clear all particles
}

window.addEventListener('load', () => {
    const welcomeModal = document.getElementById('welcome-modal');
    const openInvitationBtn = document.getElementById('open-invitation-btn');

    createParticles(); // Initialize particles

    openInvitationBtn.addEventListener('click', () => {
        removeParticles(); // Remove particles
        welcomeModal.style.display = 'none';
    });

    history.scrollRestoration = 'manual'; // Disable automatic scroll restoration
    window.scrollTo(0, 0); // Force scroll to the top
});