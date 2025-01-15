// API URL
const API_URL = 'http://localhost:3000/productos';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const productForm = document.getElementById('productForm');
const btnClear = document.getElementById('btnClear');

// Custom Alert Function
function showCustomAlert(message, onConfirm) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    // Create alert container
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    
    // Alert content
    alertDiv.innerHTML = `
        <p class="alert-message">${message}</p>
        <div class="alert-buttons">
            <button class="alert-btn alert-btn-confirm">Confirmar</button>
            <button class="alert-btn alert-btn-cancel">Cancelar</button>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(overlay);
    document.body.appendChild(alertDiv);
    
    // Handle buttons
    const confirmBtn = alertDiv.querySelector('.alert-btn-confirm');
    const cancelBtn = alertDiv.querySelector('.alert-btn-cancel');
    
    // Close alert function
    const closeAlert = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(alertDiv);
    };
    
    // Event listeners
    confirmBtn.addEventListener('click', () => {
        closeAlert();
        onConfirm();
    });
    
    cancelBtn.addEventListener('click', closeAlert);
}

// Fetch and display products
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products in the grid
function displayProducts(products) {
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-products-message">No se han encontrado productos.</p>';
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <article class="product-card">
            <img src="${product.imagen}" alt="${product.nombre}" class="product-image" onerror="handleImageError(this)">
            <div class="product-info">
                <h3 class="product-title">${product.nombre}</h3>
                <p class="product-price">$ ${parseFloat(product.precio).toFixed(2)}</p>
                <button onclick="confirmDelete(${product.id})" class="delete-btn">🗑️</button>
            </div>
        </article>
    `).join('');
}

// Confirm delete
function confirmDelete(id) {
    showCustomAlert('¿Estás seguro de que quieres eliminar este producto?', () => deleteProduct(id));
}

// Add new product
async function addProduct(product) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...product,
                id: Date.now() // Use timestamp as ID to ensure it's a number
            })
        });
        
        if (response.ok) {
            const newProduct = await response.json();
            await loadProducts();
            clearForm();
        }
    } catch (error) {
        console.error('Error adding product:', error);
    }
}

// Delete product
async function deleteProduct(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadProducts();
        } else {
            console.error('Error deleting product:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Clear form fields
function clearForm() {
    productForm.reset();
}

// Event Listeners
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const product = {
        nombre: document.getElementById('nombre').value,
        precio: parseFloat(document.getElementById('precio').value),
        imagen: document.getElementById('imagen').value
    };
    
    await addProduct(product);
});

btnClear.addEventListener('click', clearForm);

// Initial load
document.addEventListener('DOMContentLoaded', loadProducts);

// Error handling for images
function handleImageError(img) {
    img.onerror = null;
    img.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNNLEL-qmmLeFR1nxJuepFOgPYfnwHR56vcw&s';
}

