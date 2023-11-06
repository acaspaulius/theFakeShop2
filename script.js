// --  Variables --
const rootElement = document.querySelector('#root');

const API_BASE = 'https://fakestoreapi.com/';

let cachedProducts = {
  categories: [],
  'all products': [],
};

let selectedCategory;

// -- Functions --
// --- Utilities --
const getData = async (endpoint) => {
  const data = await (await fetch(endpoint)).json();

  return data;
};

const generateLayout = (location, cb) => {
  const section = document.createElement('section');

  location.appendChild(section);

  cb(section);
};

const clearLocation = (location) => {
  while (location.firstChild) {
    location.removeChild(location.firstChild);
  }
};

// --- Product categories list ---
const displayProductCategoriesGrid = async (location) => {
  const productCategories = await getData(API_BASE + 'products/categories');

  cachedProducts.categories = productCategories;

  const productCategoriesContainer = document.createElement('div');
  productCategoriesContainer.classList.add('product-categories');

  // -- All products
  const allProducts = document.createElement('div');
  allProducts.classList.add('product-categories__category', 'all-products');
  allProducts.innerText = 'ALL PRODUCTS';
  allProducts.addEventListener('click', () => {
    selectedCategory = 'all products';
    displayProductsInCategoryAndSidebar('all products', location);
  });

  productCategoriesContainer.appendChild(allProducts);

  // -- Products categories
  productCategories.forEach((category) => {
    const productCategory = document.createElement('div');
    productCategory.classList.add('product-categories__category');
    productCategory.innerText = category.charAt(0).toUpperCase() + category.slice(1);

    productCategory.addEventListener('click', () => {
      selectedCategory = category;
      displayProductsInCategoryAndSidebar(category, location);
    });

    productCategoriesContainer.appendChild(productCategory);

    // -- adding property for cache
    cachedProducts[category] = [];
  });

  location.appendChild(productCategoriesContainer);
};

// --- Product category  ---
const displayProductsInCategoryAndSidebar = async (category, location) => {
  clearLocation(location);

  const productsContainer = document.createElement('div');
  productsContainer.classList.add('products-container');

  displaySidebar(cachedProducts.categories, productsContainer);

  const productsUri = category === 'all products' ? 'products' : `products/category/${category}`;

  const categoryProducts = await getData(API_BASE + productsUri);

  for (const x in cachedProducts) {
    if (x === category) {
      cachedProducts[x] = categoryProducts;
    }
  }

  displayProducts(categoryProducts, productsContainer);

  location.appendChild(productsContainer);
};

const displayProducts = (productsArray, location) => {
  const itemToRemove = Array.from(location.children).find((x) => x.className === 'products');
  if (itemToRemove) {
    location.removeChild(itemToRemove);
  }

  const products = document.createElement('div');
  products.classList.add('products');

  productsArray.forEach((product) => {
    const productCard = document.createElement('div');
    const productImage = document.createElement('img');
    const productTitle = document.createElement('h3');
    const productCategory = document.createElement('p');
    const productPrice = document.createElement('p');
    const productDescription = document.createElement('p');

    productCard.classList.add('product-card');
    productImage.src = product.image;
    productTitle.classList.add('product-title');
    productTitle.innerText = product.title;
    productCategory.classList.add('product-category');
    productCategory.innerText = `- ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}`;
    productPrice.classList.add('product-price');
    productPrice.innerText = `$${product.price}`;
    productDescription.classList.add('product-description');
    productDescription.innerText = product.description;

    productCard.append(productImage, productTitle, productCategory, productPrice, productDescription);

    products.appendChild(productCard);
  });

  if (!productsArray.length) {
    products.innerText = 'No products.';
  }
  location.appendChild(products);
};

const displaySidebar = (categoriesArray, location) => {
  const sidebar = document.createElement('div');
  sidebar.classList.add('sidebar');

  // - search
  const searchContainer = document.createElement('div');
  const searchLabel = document.createElement('label');
  const searchInput = document.createElement('input');

  searchContainer.classList.add('sidebar__search');

  searchLabel.classList.add('sidebar-title');
  searchLabel.setAttribute('for', 'search');
  searchLabel.innerText = 'Search';

  searchInput.setAttribute('type', 'search');
  searchInput.setAttribute('id', 'search');
  searchInput.setAttribute('placeholder', 'Search product by name...');

  searchInput.addEventListener('input', (e) => {
    const searchValue = e.target.value;

    const filteredProductsAfterSearch = cachedProducts[selectedCategory].filter((x) => x.title.toLowerCase().includes(searchValue.toLowerCase()));

    displayProducts(filteredProductsAfterSearch, location);
  });

  searchContainer.append(searchLabel, searchInput);

  // - categories
  const categoriesContainer = document.createElement('div');
  const categoriesTitle = document.createElement('p');
  const categoriesUl = document.createElement('ul');

  categoriesContainer.classList.add('sidebar__categories');

  categoriesTitle.classList.add('sidebar-title');
  categoriesTitle.innerText = 'Product categories';

  // -- products all
  const allProductsLi = document.createElement('li');
  if (selectedCategory === 'all products') {
    allProductsLi.classList.add('active');
  }
  allProductsLi.innerText = 'All products';

  allProductsLi.addEventListener('click', async () => {
    document.querySelectorAll('.sidebar .sidebar__categories ul li.active').forEach((active) => active.classList.remove('active'));

    document.querySelectorAll('.sidebar .sidebar__sort ul li.active').forEach((active) => active.classList.remove('active'));

    allProductsLi.classList.add('active');
    selectedCategory = 'all products';
    searchInput.value = '';

    let selectedAllProductsProducts;

    if (cachedProducts['all products'].length) {
      selectedAllProductsProducts = cachedProducts['all products'];
    } else {
      selectedAllProductsProducts = await getData(API_BASE + 'products');

      cachedProducts['all products'] = selectedAllProductsProducts;
    }

    displayProducts(selectedAllProductsProducts, location);
  });

  categoriesUl.appendChild(allProductsLi);

  // -- products categories
  categoriesArray.forEach((category) => {
    const categoryLi = document.createElement('li');
    categoryLi.innerText = category.charAt(0).toUpperCase() + category.slice(1);
    categoryLi.setAttribute('data-category', category);

    if (selectedCategory === category) {
      categoryLi.classList.add('active');
    }

    categoryLi.addEventListener('click', async (e) => {
      document.querySelectorAll('.sidebar .sidebar__categories ul li.active').forEach((active) => active.classList.remove('active'));

      document.querySelectorAll('.sidebar .sidebar__sort ul li.active').forEach((active) => active.classList.remove('active'));

      categoryLi.classList.add('active');
      const clickSelectedCategory = e.target.dataset.category;
      selectedCategory = clickSelectedCategory;
      searchInput.value = '';
      let selectedCategoryProducts;

      if (cachedProducts[clickSelectedCategory].length) {
        selectedCategoryProducts = cachedProducts[clickSelectedCategory];
      } else {
        selectedCategoryProducts = await getData(API_BASE + `products/category/${clickSelectedCategory}`);

        for (const x in cachedProducts) {
          if (x === category) {
            cachedProducts[x] = selectedCategoryProducts;
          }
        }
      }

      displayProducts(selectedCategoryProducts, location);
    });

    categoriesUl.appendChild(categoryLi);
  });

  categoriesContainer.append(categoriesTitle, categoriesUl);

  // sorting
  const sortContainer = document.createElement('div');
  const sortTitle = document.createElement('p');
  const sortUl = document.createElement('ul');

  sortContainer.classList.add('sidebar__sort');

  sortTitle.classList.add('sidebar-title');
  sortTitle.innerText = 'Sort by';

  ['price', 'rating'].forEach((sortByValue) => {
    const li1 = document.createElement('li');
    const li2 = document.createElement('li');

    li1.innerText = `${sortByValue.charAt(0).toUpperCase() + sortByValue.slice(1)} asc`;
    li2.innerText = `${sortByValue.charAt(0).toUpperCase() + sortByValue.slice(1)} desc`;

    li1.addEventListener('click', () => {
      document.querySelectorAll('.sidebar .sidebar__sort ul li.active').forEach((active) => active.classList.remove('active'));
      li1.classList.add('active');

      const sortOrder = 'asc';
      const sortedProducts = cachedProducts[selectedCategory].slice().sort((a, b) => {
        if (sortByValue === 'price') {
          return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        } else if (sortByValue === 'rating') {
          return sortOrder === 'asc' ? a.rating.rate - b.rating.rate : b.rating.rate - a.rating.rate;
        }
      });
      displayProducts(sortedProducts, location);
    });

    li2.addEventListener('click', () => {
      document.querySelectorAll('.sidebar .sidebar__sort ul li.active').forEach((active) => active.classList.remove('active'));
      li2.classList.add('active');

      const sortOrder = 'desc';
      const sortedProducts = cachedProducts[selectedCategory].slice().sort((a, b) => {
        if (sortByValue === 'price') {
          return sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
        } else if (sortByValue === 'rating') {
          return sortOrder === 'desc' ? b.rating.rate - a.rating.rate : a.rating.rate - b.rating.rate;
        }
      });
      displayProducts(sortedProducts, location);
    });

    sortUl.append(li1, li2);
  });

  sortContainer.append(sortTitle, sortUl);

  // - appending itmes to sidebar
  sidebar.append(searchContainer, categoriesContainer, sortContainer);
  location.appendChild(sidebar);
};

// -- Events --
document.addEventListener('DOMContentLoaded', () => {
  generateLayout(rootElement, displayProductCategoriesGrid);

  setInterval(() => {
    cachedProducts = {
      categories: [],
      'all products': [],
    };
  }, 3600000);
});
