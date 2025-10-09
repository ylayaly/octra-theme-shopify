// JavaScript code for handling filters and sorting on a collection page
let filtersData = [];
const filters = document.querySelectorAll('[otw-data-filter]');
const sortByLabel = document.querySelectorAll('[otw-sort-by]');
const sortByItem = document.querySelectorAll('[otw-sort-by-item]');
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

function renderActiveFilters() {
    // const wrapperFilters = document.querySelector('[otw-filters-active]');
    const activeFilters = Array.from(filters).filter((filter) => filter.classList.contains('active'));
    // wrapperFilters.innerHTML = '';

    activeFilters.forEach((filter) => {

        // const newFilterButton = filterButton.cloneNode(true);
        // newFilterButton.removeAttribute('style');

        // Personalizar el contenido del botón clonado
        // const textElement = newFilterButton.querySelector('.mat-text-2');
        // const textValue = filter.querySelector('[otw-filter-name]');
        // if (textElement && textValue) {
        //     textElement.textContent = textValue.textContent; // Actualizar el texto con el valor del filtro
        // }

        // Agregar un evento para eliminar el filtro al hacer clic en el botón clonado
        // newFilterButton.addEventListener('click', () => {
        //     filter.classList.remove('active'); // Quitar la clase 'active' del filtro original
        //     setFilterFormat(); // Actualizar los filtros activos y la URL
        // });

        // Agregar el botón clonado al contenedor de filtros activos
        // wrapperFilters.appendChild(newFilterButton);
    });


}

function setFilterFormat(page = null, init = false) {
    renderActiveFilters()
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

    const sortBy = Array.from(sortByItem).find((sort => sort.classList.contains('active')))
    const sortByValue = sortBy ? sortBy.getAttribute('otw-sort-by-item') : null;
    if (sortByValue) {
        activeFilters.push({
            filterType: 'sort_by',
            filterValue: sortByValue
        });
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

    if (!sortByValue && sortByLabel.length > 0) {
        activeFilters.push({
            filterType: 'sort_by',
            filterValue: sortByLabel[0].getAttribute('otw-sort-by')
        });
    }

    const baseUrl = window.location.pathname;
    const queryParams = activeFilters
        .map((filter) => `${encodeURIComponent(filter.filterType)}=${encodeURIComponent(filter.filterValue)}`)
        .join('&');
    const fullUrl = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

    const filterDataUrl = (element) => element.url === fullUrl;

    console.log(filtersData.some(filterDataUrl));
    

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
        // console.log('Response HTML:', html);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });


}

// Debounce utility function
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
    // Create a debounced version of setFilterFormat
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

    sortByItem.forEach((sort) => {
        sort.addEventListener('click', (e) => {
            if (sortByLabel) {
                const valueLabel = sort.textContent;
                sortByLabel[0].textContent = valueLabel;
            }
            sortByItem.forEach((item) => {
                item.classList.remove('active');
            });

            sort.classList.add('active');
            document.querySelector('[otw-sort-by-list]').classList.remove('w--open');
            debouncedSetFilterFormat();

        });
    });

    // groupFilters.forEach((group) => {
    //     group.addEventListener('click', (e) => {
    //         let isGroupFilter = e.target.getAttribute('otw-group-filter');
    //         let target = e.target
    //         if (!isGroupFilter) {
    //             target = target.closest('[otw-group-filter]')
    //         }

    //         target.classList.toggle('mat-open');
    //         target.closest('[otw-filter-section]').classList.toggle('mat-group-open');


    //     });
    // });

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

    // document.querySelector('[otw-sort-by-btn]').addEventListener('click', () => {
    //     document.querySelector('[otw-sort-by-list]').classList.toggle('w--open');
    // });

    setFilterFormat(null, true);
});
