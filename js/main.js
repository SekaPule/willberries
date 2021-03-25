const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

//cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)');
const longGoodsList = document.querySelector('.long-goods-list');
const viewAccessories = document.querySelectorAll('.view-accessories');
const viewClothing = document.querySelectorAll('.view-clothing');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');
const cartClear = document.querySelector('.cart-clear');

const getGoods = async ()=> {
	const result = await fetch('db/db.json');
	if(!result.ok){
		throw 'Ошибка: '+ result.status
	}
	return result.json();
};

const cart = {
	cartGoods: [],
	renderCart(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({id,name,price,count}) =>{
			const trGood = document.createElement('tr');
			 trGood.className = 'cart-item';
			 trGood.dataset.id = id;

			 trGood.innerHTML = `
\t\t\t\t\t<td>${name}</td>
\t\t\t\t\t<td>${price}$</td>
\t\t\t\t\t<td><button class="cart-btn-minus">-</button></td>
\t\t\t\t\t<td>${count}</td>
\t\t\t\t\t<td><button class="cart-btn-plus">+</button></td>
\t\t\t\t\t<td>${price*count}$</td>
\t\t\t\t\t<td><button class="cart-btn-delete">x</button></td>
			 `;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((acc,item)=>{
			return acc + (item.price * item.count);
		}, 0)
		cardTableTotal.textContent = totalPrice+'$';
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter((item) => id !== item.id)
		this.renderCart();
		this.updateCartCounter();
	},
	minusGood(id){
		for(const item of this.cartGoods){
			if(item.id === id){
				if(item.count <= 1){
					this.deleteGood(id);
				}else{
					item.count--;
				}
				break;
			}
		}
		this.renderCart();
		this.updateCartCounter();
	},
	plusGood(id){
		for(const item of this.cartGoods){
			if(item.id === id){
				item.count++;
				break;
			}
		}
		this.renderCart();
		this.updateCartCounter();
	},
	updateCartCounter(){
		 const cartCounter = this.cartGoods.reduce((acc, item) => {
			console.log(item);
			return acc + item.count;
		}, 0);
		cartCount.textContent = cartCounter;

	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item =>  item.id === id);
		if(goodItem){
			this.plusGood(id);
		}else{
			getGoods()
				.then(data => data.find(item => item.id === id))
				.then(({id,name,price}) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count:1
					});
					this.updateCartCounter();
				});
		}
	},
	clearCart(){
		this.cartGoods.length = 0;
		this.renderCart();
		this.updateCartCounter();
	}
}

cartClear.addEventListener('click', event =>{
	event.preventDefault();
	cart.clearCart();
	console.log(cart.cartGoods);
})

document.body.addEventListener('click', event =>{
	const addToCart = event.target.closest('.add-to-cart');

	if(addToCart){
		cart.addCartGoods(addToCart.dataset.id);
	}
})

cartTableGoods.addEventListener('click', event => {
	const target = event.target;
	if (target.classList.contains('cart-btn-delete')){
		const id = target.closest('.cart-item').dataset.id;
		cart.deleteGood(id);
	}
	if (target.classList.contains('cart-btn-plus')){
		const id = target.closest('.cart-item').dataset.id;
		cart.plusGood(id);
	}
	if (target.classList.contains('cart-btn-minus')){
		const id = target.closest('.cart-item').dataset.id;
		cart.minusGood(id);
	}
})

const openModal = ()=>{
	cart.renderCart();
	modalCart.classList.add('show')
};

const closeModal = ()=>{
	modalCart.classList.remove('show')
};

buttonCart.addEventListener('click', openModal);

modalCart.addEventListener('click', function (event){
	const target = event.target;
	if(target.classList.contains('overlay') || target.classList.contains('modal-close')){
		closeModal()
	}
})

//scroll smooth

const scrollLinks = document.querySelectorAll('a.scroll-link');

(function(){
	for(const scrollLink of scrollLinks){
		scrollLink.addEventListener('click', event => {
			event.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior:"smooth",
				block:"start",
			})
		});
	}
})();

//goods

const createCard = function ({label ,img, name, description, id, price}) {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';
	card.innerHTML = `
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>`:'' }
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
 			<p class="goods-description">${description}</p>
			 <button class="button goods-card-btn add-to-cart" data-id=${id}>
			 <span class="button-price">$${price}</span>
			 </button>
 		</div>
	`;

	return card;
};

const renderCards = function (data) {
	longGoodsList.textContent = '';
	const cards = data.map(createCard);
	cards.forEach(function (card) {
		longGoodsList.append(card)
	})
	document.body.classList.add('show-goods');
};

viewAll.forEach(elem=> {
	elem.addEventListener('click', event => {
		event.preventDefault();
		getGoods().then(renderCards);
	})
})

const filterCards = function (field, value) {
	getGoods()
		.then(data => data.filter(good => good[field] === value))
		.then(renderCards);
};

navigationLink.forEach(function (link) {
	link.addEventListener('click', event =>{
		event.preventDefault();
		const field = link.dataset.field;
		console.log(field);
		const value = link.textContent;
		console.log(value);
		filterCards(field,value);
	})
});

viewAccessories.forEach(item=>{
	item.addEventListener('click', event=>{
		event.preventDefault();
		filterCards('category', 'Accessories');
	});
});

viewClothing.forEach(item=>{
	item.addEventListener('click', event=>{
		event.preventDefault();
		filterCards('category', 'Clothing');
	});
});