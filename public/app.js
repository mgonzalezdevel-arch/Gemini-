// Elementos DOM
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeBtn = document.getElementById('removeBtn');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const resultImage = document.getElementById('resultImage');
const loadingOverlay = document.getElementById('loadingOverlay');
const downloadBtn = document.getElementById('downloadBtn');
const newBtn = document.getElementById('newBtn');
const toast = document.getElementById('toast');
const exampleBtns = document.querySelectorAll('.example-btn');

let selectedFile = null;

// Event Listeners
uploadArea.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleFileSelect);
removeBtn.addEventListener('click', removeImage);
promptInput.addEventListener('input', checkFormValid);
generateBtn.addEventListener('click', generateImage);
downloadBtn.addEventListener('click', downloadImage);
newBtn.addEventListener('click', resetForm);

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    } else {
        showToast('Por favor sube una imagen válida', 'error');
    }
});

// Botones de ejemplo
exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        promptInput.value = btn.getAttribute('data-prompt');
        checkFormValid();
        promptInput.focus();
    });
});

// Funciones
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast('Solo se permiten archivos JPG, PNG o WEBP', 'error');
        return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen debe ser menor a 5MB', 'error');
        return;
    }

    selectedFile = file;

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        uploadPlaceholder.style.display = 'none';
        previewContainer.style.display = 'block';
        checkFormValid();
    };
    reader.readAsDataURL(file);
}

function removeImage(e) {
    e.stopPropagation();
    selectedFile = null;
    imageInput.value = '';
    uploadPlaceholder.style.display = 'block';
    previewContainer.style.display = 'none';
    checkFormValid();
}

function checkFormValid() {
    const hasImage = selectedFile !== null;
    const hasPrompt = promptInput.value.trim().length > 0;
    generateBtn.disabled = !(hasImage && hasPrompt);
}

async function generateImage() {
    if (!selectedFile || !promptInput.value.trim()) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }

    // Mostrar loading
    loadingOverlay.style.display = 'flex';

    try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('prompt', promptInput.value.trim());

        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al generar la imagen');
        }

        // Mostrar resultado
        resultImage.src = data.image;
        resultSection.style.display = 'block';
        
        // Scroll al resultado
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        showToast('¡Imagen generada exitosamente! 🎉', 'success');

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'Error al generar la imagen', 'error');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

function downloadImage() {
    const link = document.createElement('a');
    link.href = resultImage.src;
    link.download = `nano-banana-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Imagen descargada', 'success');
}

function resetForm() {
    selectedFile = null;
    imageInput.value = '';
    promptInput.value = '';
    uploadPlaceholder.style.display = 'block';
    previewContainer.style.display = 'none';
    resultSection.style.display = 'none';
    generateBtn.disabled = true;
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Verificar salud de la API al cargar
async function checkApiHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (!data.hasApiKey) {
            showToast('⚠️ Configura tu GOOGLE_API_KEY en el archivo .env', 'error');
        }
    } catch (error) {
        console.error('Error al verificar la API:', error);
    }
}

// Ejecutar al cargar la página
checkApiHealth();
