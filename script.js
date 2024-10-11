document.querySelector('#searchForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from refreshing the page

    const query = document.querySelector('#query').value;
    if (query) {
        searchPubMed(query);
    }
});

function searchPubMed(query) {
    const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${query}&retmode=json&retmax=5`;

    fetch(esearchUrl)
        .then(response => response.json())
        .then(data => {
            const ids = data.esearchresult.idlist;
            if (ids.length > 0) {
                fetchArticleDetails(ids);
            } else {
                document.getElementById('results').innerHTML = 'No articles found.';
            }
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            document.getElementById('results').innerHTML = 'Error fetching search results.';
        });
}

function fetchArticleDetails(ids) {
    const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=${ids.join(',')}&retmode=xml`;

    fetch(efetchUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');

            // Clear any previous results
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '';

            // Loop through each article
            const articles = xmlDoc.getElementsByTagName('article');
            for (let i = 0; i < articles.length; i++) {
                const title = articles[i].getElementsByTagName('article-title')[0].textContent;
                const abstract = articles[i].getElementsByTagName('abstract')[0]?.textContent || 'No abstract available';

                // Create result item
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                resultItem.innerHTML = `
                    <h3>${title}</h3>
                    <p>${abstract}</p>
                `;
                resultsContainer.appendChild(resultItem);
            }
        })
        .catch(error => {
            console.error('Error fetching article details:', error);
            document.getElementById('results').innerHTML = 'Error fetching article details.';
        });
}
