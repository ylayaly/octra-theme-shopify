let filtersData = [];
const filters = document.querySelectorAll('[otw-data-filter]');
const paginationLinks = document.querySelectorAll('.pagination__item');
const productsContainer = document.getElementById('otw-products-container');

function clearFilters() {
    filters.forEach((filter) => {
        filter.classList.remove('active');
    });
    productsContainer.classList.add('loading');
    setFilterFormat();
}

function renderProductsFiltered(html) {

    productsContainer.innerHTML = new DOMParser()
        .parseFromString(html, 'text/html')
        .getElementById('otw-products-container').innerHTML;

    let paginationLoad = new DOMParser()
        .parseFromString(html, 'text/html')
        .getElementById('otw-pagination')

    if (paginationLoad) {
        paginationLoad = paginationLoad.innerHTML;
    } else {
        paginationLoad = "";
    }

    document.getElementById('otw-pagination').innerHTML = paginationLoad;

    document.querySelectorAll('.pagination__item').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const href = item.getAttribute('href');
            const url = href.split('?')[1];
            const params = new URLSearchParams(url);
            const page = params.get('page');
            setFilterFormat(page);
        });
    });

    productsContainer.classList.remove('loading');

}

function setFilterFormat(page = null, init = false) {
    const activeFilters = Array.from(filters).filter((filter => filter.classList.contains('active')))
        .map((filter) => {
            const filterType = filter.getAttribute('otw-data-filter');
            const filterValue = filter.getAttribute('otw-data-value');

            return {
                filterType: filterType,
                filterValue: filterValue
            }
        });
    
    if (activeFilters.length === 0) {
        document.querySelector('[otw-remove-filters]').classList.add('hide');
    } else {
        document.querySelector('[otw-remove-filters]').classList.remove('hide');
    }

    if (page) {
        activeFilters.push({
            filterType: 'page',
            filterValue: page
        });
    }

    if (init) {
        return;
    }

    const baseUrl = window.location.pathname;
    const queryParams = activeFilters
        .map((filter) => `${encodeURIComponent(filter.filterType)}=${encodeURIComponent(filter.filterValue)}`)
        .join('&');
    const fullUrl = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

    const filterDataUrl = (element) => element.url === fullUrl;
    

    if (filtersData.some(filterDataUrl)) {
        const htmlCache = filtersData.find(filterDataUrl).html;
        renderProductsFiltered(htmlCache);
        return;
    }

    fetch(fullUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then((response) => response.text())
    .then((responseText) => {
        const html = responseText;
        filtersData = [...filtersData, { html, url: fullUrl }];
        renderProductsFiltered(html);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });


}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const debouncedSetFilterFormat = debounce(setFilterFormat, 800);

    filters.forEach((filter) => {
        filter.addEventListener('click', (e) => {
            let filterType = e.target.getAttribute('otw-data-filter');
            let filterValue = e.target.getAttribute('otw-data-value');
            let target = e.target
            if (!filterType || !filterValue) {
                const parent = e.target.closest('[otw-data-filter]');
                if (parent) {
                    filterType = parent.getAttribute('otw-data-filter');
                    filterValue = parent.getAttribute('otw-data-value');
                    target = parent;
                }
            }

            target.classList.toggle('active');
            productsContainer.classList.add('loading');
            debouncedSetFilterFormat();
        });
    });

    paginationLinks.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const href = item.getAttribute('href');
            const url = href.split('?')[1];
            const params = new URLSearchParams(url);
            const page = params.get('page');
            setFilterFormat(page);
        });
    });

    setFilterFormat(null, true);
});
