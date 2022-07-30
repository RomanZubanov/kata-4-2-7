class View {
    constructor() {
        this.app = document.getElementById('app');
        this.searchline = this.createElement('div', 'search-line');
        this.searchInput = this.createElement('input', 'search-input');

        this.suggestList = this.createElement('ul', 'suggest-list');

        this.repoList = this.createElement('ul', 'repo-list')

        this.searchline.append(this.searchInput);
        this.app.append(this.searchline);
        this.app.append(this.suggestList);
        this.app.append(this.repoList);
    }

    createElement(elementTag, elementClass) {
        const element = document.createElement(elementTag);
        if (elementClass) {
            element.classList.add(elementClass);
        }
        return element
    }

    createRepoSuggest(repoData) {
        const repoSuggestItem = this.createElement('li', 'repo-suggest-item');
        repoSuggestItem.addEventListener('click', () => {
            this.createRepoItem(repoData.name, repoData.owner.login, repoData.stargazers_count)
            this.clearRepoSuggest()
        })
        repoSuggestItem.textContent = `${repoData.name}`
        this.suggestList.append(repoSuggestItem)
    }

    clearRepoSuggest() {
        this.suggestList.innerHTML = ''
    }

    createRepoItem(name, owner, stars) {
        const repoItem = this.createElement('li', 'repo-item');
        repoItem.innerHTML = `<p>Name: ${name}</p><p>Owner: ${owner}</p><p>Stars: ${stars}</p>`;
        const btnClose = this.createElement('div', 'btn-close');
        btnClose.addEventListener('click', () => {
            repoItem.remove()
        });
        repoItem.append(btnClose);
        this.repoList.append(repoItem);
    }

}

const REPO_PER_PAGE = 5

class Search {
    constructor(view) {
        this.view = view;
        this.view.searchInput.addEventListener('keyup', this.debounce(this.searchRepos.bind(this), 500));
    }

    async searchRepos() {
        this.view.clearRepoSuggest()
        const searchValue = this.view.searchInput.value
        if (searchValue) {
            return await fetch(`https://api.github.com/search/repositories?q=${searchValue}&per_page=${REPO_PER_PAGE}`)
                .then(res => {
                    if (res.ok) {
                        res.json().then(res => {
                            res.items.forEach(repo => this.view.createRepoSuggest(repo))
                        })
                    } else {
                        console.log('ERROR nado obrabotat')
                    }
                })
        } else {
            this.view.clearRepoSuggest()
        }
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            const later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

}

new Search(new View())