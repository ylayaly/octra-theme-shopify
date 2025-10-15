
const breadcrumb_product_collection = $("#fk-product-collection")
if (breadcrumb_product_collection.length > 0) {
    const history = document.referrer;
    if (history) {
        const url = new URL(history);
        const referrerCollection = url.pathname;
        const collections = $("#fk-product-collections span");
        const collection = collections.filter(function () {
            const collectionUrl = $(this).data("url");
            return collectionUrl == referrerCollection;
        });
        if (collection.length > 0) {
            breadcrumb_product_collection.text(collection.data("title"));
            breadcrumb_product_collection.attr("href", collection.data("url"));
        }
    }
}


const toggles = document.querySelectorAll('[otw-toggle]');
toggles.forEach((toggle) => {
    toggle.addEventListener('click', function () {
        this.classList.toggle('open');
    });
});

function readVariantFromDOM() {
    const variantScript = document.querySelector('[data-selected-variant]');
    if (variantScript) {
        return JSON.parse(variantScript.textContent);
    }
    return null;
}



function renderPrice(comparePrice, productFinalyPrice, hasComparePrice) {

    const htmlButton = `<span class="product-selling-price def-span-1 ${hasComparePrice}" id="productVariantPrice">${comparePrice}</span>
    <span class="product-price" id="productFinalyPrice">${productFinalyPrice}</span>`;

    const formButton = document.querySelector("[id^='ProductSubmitButton-template--']");

    if (formButton) {
        const formButtonInfo = formButton.querySelectorAll('[data-otw-info] > span');
        if (formButtonInfo) {
            formButtonInfo.forEach((info) => {
                info.remove();
            });
            formButton.querySelector('[data-otw-info]').insertAdjacentHTML('beforeend', htmlButton);
        }
    }
}


const options2 = document.querySelectorAll('input.product-variant-id');
options2.forEach((radioInput) => {
    radioInput.addEventListener('change', function (event) {
        const allSectionsSellingPlan = document.querySelectorAll("section[data-otw-variant-id]");
        allSectionsSellingPlan.forEach(sp => {
            sp.classList.add('selling_plan_theme_integration--hidden');
        });
        const sectionSellingPlan = document.querySelectorAll("section[data-otw-variant-id='" + event.target.value + "']")[0];
        if (sectionSellingPlan) {
            sectionSellingPlan.classList.remove('selling_plan_theme_integration--hidden');
        }

        setTimeout(() => {
            const selectedVariant = readVariantFromDOM();
            if (selectedVariant) {
                
                let hasComparePrice = "";
                let elButtonPrice = "<i></i>";
                let productFinalyPrice = "$ " + parseInt(selectedVariant.price) / 100;
                elButtonPrice += "<span>" + productFinalyPrice + "</span>";

                const sellingPlanSelected = document.querySelector("[name$='__main_" + selectedVariant.id + "_clone']:checked");
                if (sellingPlanSelected && sellingPlanSelected.dataset.variantCompareAtPrice) {
                    elButtonPrice = ` <span><i></i>${sellingPlanSelected.dataset.variantCompareAtPrice}</span>`;
                    hasComparePrice = "show";
                    productFinalyPrice = sellingPlanSelected.dataset.variantPrice;
                }
                
                
                
                renderPrice(elButtonPrice, productFinalyPrice, hasComparePrice);
            }
        }, 300);
    });
});

const optionClones = document.querySelectorAll('input[data-clone]');
optionClones.forEach((radioInput) => {
    radioInput.addEventListener('change', function (event) {
        const sectionSellingPlan = document.querySelector("section[data-otw-variant-id='" + event.target.dataset.variantId + "'].def-wrap-1-6");

        let originalRadio = document.querySelector("input[name='" + event.target.name.replace('_clone', '') + "'][data-selling-plan-id='" + event.target.value + "']");
        let isSelling = true
        const comparePrice = event.target.dataset.variantCompareAtPrice;


        if (!originalRadio) {
            originalRadio = document.querySelector("input[name='" + event.target.name.replace('_clone', '') + "'][data-radio-type='one_time_purchase']");
            sectionSellingPlan.querySelector(".def-icon-5-1").classList.remove('selected');
            isSelling = false
        } else {
            sectionSellingPlan.querySelector(".def-icon-5-1").classList.add('selected');
        }

        if (originalRadio) {
            originalRadio.checked = true;
            originalRadio.dispatchEvent(new Event('change'));

        }

        const selectedPlanText = document.querySelector("#selling-plan-selected_" + event.target.dataset.variantId);
        if (selectedPlanText) {
            const parentElement = event.target.parentElement;
            const spanElement = parentElement ? parentElement.querySelector('span.def-text-1-33') : null;
            const content = spanElement ? spanElement.innerHTML : 'Select one';
            selectedPlanText.innerHTML = content;

            const el = selectedPlanText.closest('.w-dropdown');
            $(el).triggerHandler('w-close.w-dropdown');
        }

        let elButtonPrice = "<i></i>";
        let productFinalyPrice = event.target.dataset.variantPrice;
        let hasComparePrice = "";

        if (sectionSellingPlan && isSelling) {
            const discountPlan = event.target.dataset.allocation_discounted_price;
            const eldiscountPlan = sectionSellingPlan.querySelector('[data-selling-plan-discounted-price]');
            if (eldiscountPlan && discountPlan) {
                eldiscountPlan.innerHTML = discountPlan;
            }

            const pricePlan = event.target.dataset.variantPrice;
            const elpricePlan = sectionSellingPlan.querySelector('[data-selling-plan-price]');
            if (elpricePlan && pricePlan) {
                elpricePlan.innerHTML = pricePlan;

                elButtonPrice = "<i></i>" + comparePrice;
                hasComparePrice = "show";

            }

        }

        renderPrice(elButtonPrice, productFinalyPrice, hasComparePrice);

        closeDrop(event.target);



    });
});

const closeDrop = (el) => {
    const parent = el.closest('[data-dropdown-wrapper]');
    const list = parent ? parent.querySelector('[data-otw-dropdown-list]') : null;
    if (parent && list) {
        const heightList = list.scrollHeight;
        if (parent.classList.contains('open')) {
            list.style.maxHeight = '0px';
        } else {
            list.style.maxHeight = heightList + 'px';
        }
        parent.classList.toggle('open');
    }
}


const openDrop = document.querySelectorAll('[data-otw-dropdown-button]');
openDrop.forEach((el) => {
    el.addEventListener('click', closeDrop.bind(this, el));
});