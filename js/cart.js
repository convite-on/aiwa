// Implementação mínima para cart.html funcionar isoladamente
window.cart = window.cart || {};

window.cart.items = [];

window.cart.init = function() {
	try {
		window.cart.items = JSON.parse(localStorage.getItem('carrinho') || '[]');
	} catch (e) {
		window.cart.items = [];
	}
};

window.cart.getTotal = function() {
	return window.cart.items.reduce((acc, item) => acc + (item.preco * (item.quantidade || 1)), 0);
};

window.cart.removeItem = function(index) {
	window.cart.items.splice(index, 1);
	localStorage.setItem('carrinho', JSON.stringify(window.cart.items));
	window.cart.updateCartCount();
	// Força re-renderização
	if (typeof renderCart === 'function') renderCart();
};

window.cart.updateQuantity = function(index, quantidade) {
	if (quantidade < 1) return;
	window.cart.items[index].quantidade = quantidade;
	localStorage.setItem('carrinho', JSON.stringify(window.cart.items));
	window.cart.updateCartCount();
	if (typeof renderCart === 'function') renderCart();
};

// Limpa todo o carrinho
window.cart.clear = function() {
	window.cart.items = [];
	localStorage.setItem('carrinho', '[]');
	window.cart.updateCartCount();
	if (typeof renderCart === 'function') renderCart();
};
// Atualiza o contador do carrinho no header
window.cart = window.cart || {};
window.cart.updateCartCount = function() {
	let carrinho = [];
	try {
		carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
	} catch (e) {
		carrinho = [];
	}
	const count = carrinho.reduce((acc, item) => acc + (item.quantidade || 1), 0);
	const el = document.getElementById('cart-count-header');
	if (el) el.textContent = count;
};
// Atualiza ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
	if (window.cart && typeof window.cart.updateCartCount === 'function') {
		window.cart.updateCartCount();
	}
});
