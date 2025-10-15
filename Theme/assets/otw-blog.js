const loadMoreBtn = document.querySelector('[data-otw-load-more]');
loadMoreBtn?.addEventListener('click', function() {
    const nextPageBtn = document.querySelector('[data-otw-next-page]');
    const nextPageUrl = nextPageBtn?.getAttribute('href');
    if (nextPageUrl) {
        fetch(nextPageUrl)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const newPosts = doc.querySelectorAll('[data-otw-blog-post]');
                const postsContainer = document.querySelector('[data-otw-blog-posts]');
                newPosts.forEach(post => postsContainer.appendChild(post));
                
                // Update the next page URL
                const newNextPageUrl = doc.querySelector('[data-otw-next-page]')?.getAttribute('href');
                if (newNextPageUrl) {
                    nextPageBtn.setAttribute('href', newNextPageUrl);
                } else {
                    this.style.display = 'none'; // Hide button if no more pages
                }
            })
            .catch(error => console.error('Error loading more posts:', error));
    }
});