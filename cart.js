/**
 * German Fitness - Cart Logic
 * Handles the state and localStorage for the e-commerce shopping cart.
 */

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.listeners = [];
    }

    loadCart() {
        const savedCart = localStorage.getItem('gf_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('gf_cart', JSON.stringify(this.cart));
        this.notify();
    }

    addToCart(product) {
        // product: { id, name, price, image_url, quantity }
        const existingItem = this.cart.find(item => item.id === product.id);
        const qtyToAdd = product.quantity ? parseInt(product.quantity) : 1;
        
        if (existingItem) {
            existingItem.quantity += qtyToAdd;
        } else {
            this.cart.push({
                ...product,
                quantity: qtyToAdd
            });
        }
        this.saveCart();
        this.showToast(`${product.name} added to cart!`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity));
            this.saveCart();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    getItems() {
        return this.cart;
    }

    // Observer pattern to update UI
    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(callback => callback(this.cart));
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.innerText = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500);
            }, 2000);
        }, 100);
    }
}

const cartManager = new CartManager();
window.cartManager = cartManager; // Make it globally accessible
