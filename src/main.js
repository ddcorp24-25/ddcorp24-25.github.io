// ======== Définition des Classes ========

// Classe View : Gère l'affichage des vues
class View {
    constructor(element) {
        this.element = element;
    }

    show() {
        this.element.classList.add('active');
    }

    hide() {
        this.element.classList.remove('active');
    }
}

// Classe Router : Gère la navigation entre les vues
class Router {
    static routes = [];

    static navigate(path) {
        const route = Router.routes.find(route => route.path === path);

        if (route) {
            Router.updateMenuLink(path);
            Router.removeActiveSection();

            if (route.view) {
                route.view.show();
            } else {
                console.error('Vue pour le chemin ' + path + ' est undefined');
            }

            Router.updateTitle(route.title);
        } else {
            console.error('Route non trouvée pour le chemin : ' + path);
        }
    }

    static updateMenuLink(path) {
        document.querySelectorAll('body > header ul.mainMenu li > a')
            .forEach(link => link.classList.remove('active'));

        const activeLink = document.querySelector(`a[href="${path}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    static removeActiveSection() {
        const activeSection = document.querySelector('.viewContainer .viewContent.activeOnly > article.active');
        if (activeSection) {
            activeSection.classList.remove('active');
        }
    }

    static updateTitle(title) {
        const titleElement = document.querySelector('.viewTitle');
        if (titleElement) {
            titleElement.innerHTML = `<h1>${title}</h1>`;
        }
    }
}

// Fonction pour générer un élément de jeu
const renderGameThumbnail = ({ background_image, name, released, metacritic }) => {
    return `
    <a href="${background_image}">
        <img src="${background_image}"/>
        <footer>
            <h3>${name}</h3>
            <div class="infos">
                <time datetime="${released}">${new Date(released).toLocaleDateString()}</time>
                <span class="metacritic">${metacritic}</span>
            </div>
        </footer>
    </a>`;
};

// Classe HelpView : Gère la soumission du formulaire d'aide
class HelpView extends View {
    constructor(element) {
        super(element);
        this.helpForm = this.element.querySelector('form');
        this.helpForm.addEventListener('submit', (event) => this.handleSubmit(event));
    }

    handleSubmit(event) {
        event.preventDefault();

        const subject = this.helpForm.querySelector('input[name=subject]').value;
        const body = this.helpForm.querySelector('textarea[name=body]').value;

        if (subject === "" || body === "") {
            alert("Tous les champs doivent être remplis");
            return false;
        } else {
            const encodeSubject = encodeURIComponent(subject);
            const encodeBody = encodeURIComponent(body);

            window.location.href = `mailto:ddcorp2024@gmail.com?subject=${encodeSubject}&body=${encodeBody}`;

            alert("Merci pour votre message. Nous vous remercions de votre contribution.");
            this.helpForm.reset();
            return true;
        }
    }
}

// Classe GameListView : Affiche la liste des jeux et gère la recherche
class GameListView extends View {
    constructor(element) {
        super(element);
        this.magnifier = document.querySelector('.toggleSearchButton');
        this.form = document.querySelector('.searchForm');
        this.magnifier.addEventListener('click', () => this.toggleSearchForm());
        this.form.addEventListener('submit', (event) => this.filterForm(event));
    }

    renderGameList(data) {
        let htmlRes = '';
        data.forEach((game) => htmlRes += renderGameThumbnail(game));
        this.element.querySelector('.gameList .results').innerHTML = htmlRes;
    }

    toggleSearchForm() {
        if (this.form.getAttribute('style') === 'display: none') {
            this.form.setAttribute('style', '');
            this.magnifier.classList.add('opened');
        } else {
            this.form.setAttribute('style', 'display: none');
            this.magnifier.classList.remove('opened');
        }
    }

    filterForm(event) {
        event.preventDefault();

        const searchValue = this.form.querySelector('input[name=search]').value.toLowerCase();
        const filterValue = this.form.querySelector('select[name=ordering]').value;

        const filteredData = data.filter(game =>
            game.name.toLowerCase().includes(searchValue) || searchValue === ''
        );

        if (filterValue === '-metacritic') {
            filteredData.sort((a, b) => b.metacritic - a.metacritic);
        } else if (filterValue === '-released') {
            filteredData.sort((a, b) => new Date(b.released) - new Date(a.released));
        } else {
            filteredData.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.renderGameList(filteredData);
    }
}

// ======== Données des jeux ========
const data = [
    {
        name: 'Mario Kart 8 Deluxe',
        released: '2017-04-27',
        metacritic: 92,
        background_image: 'images/mario-kart-8-deluxe.jpg'
    },
    {
        name: 'God of War Ragnarok',
        released: '2022-11-09',
        metacritic: 94,
        background_image: 'images/god-of-war-ragnarok.jpg'
    },
    {
        name: 'The Last of Us Part 2',
        released: '2020-06-19',
        metacritic: 94,
        background_image: 'images/the-last-of-us-part-2.jpg'
    }
];

// ======== Initialisation de l'application ========
document.addEventListener("DOMContentLoaded", function () {
    // Sélection des éléments HTML pour les vues
    const helpElement = document.querySelector('.help');
    const gameListElement = document.querySelector('.gameList');
    const aboutElement = document.querySelector('.about');

    // Vérification si les éléments existent pour éviter d'autres erreurs
    if (!helpElement || !gameListElement || !aboutElement) {
        console.error("Un des éléments HTML requis est introuvable !");
        return;
    }

    // Création des instances des vues
    const helpView = new HelpView(helpElement);
    const gameListView = new GameListView(gameListElement);
    const aboutView = new View(aboutElement);

    // Définition des routes
    Router.routes = [
        { path: '/gameList', view: gameListView, title: 'Jeu' },
        { path: '/', view: gameListView, title: 'Jeu' },
        { path: '/about', view: aboutView, title: 'À propos' },
        { path: '/help', view: helpView, title: 'Support' }
    ];

    // Navigation initiale
    Router.navigate('/about');

    // Tri des données et affichage de la liste des jeux
    data.sort((a, b) => a.name.localeCompare(b.name));
    gameListView.renderGameList(data);

    // Gestion des clics sur les liens du menu
    document.querySelectorAll('body > header ul.mainMenu li > a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            Router.navigate(event.currentTarget.getAttribute('href'));
        });
    });
});
