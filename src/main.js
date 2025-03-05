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
const renderGameThumbnail = ({ background_image, name, released }) => {
    return `
    <a href="${background_image}">
        <img src="${background_image}"/>
        <footer>
            <h3>${name}</h3>
            <div class="infos">
                <time datetime="${released}">${new Date(released).toLocaleDateString()}</time>
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

        if (filterValue === '-released') {
            filteredData.sort((a, b) => new Date(b.released) - new Date(a.released));
        } else {
            filteredData.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.renderGameList(filteredData);
    }
}

// FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDYXhIt0KzqyVrn2PWDnnCsuXtHuM4cRWU",
    authDomain: "test-772d5.firebaseapp.com",
    projectId: "test-772d5",
    storageBucket: "test-772d5.appspot.com",
    messagingSenderId: "700771285719",
    appId: "1:700771285719:web:8e38ec2450931fe852ce92",
    measurementId: "G-49M4E9E35K",
    databaseURL: "https://hydrash-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function UpdateView() {
    let viewNb;
    firebase.database().ref("stats/view").once("value", (snapshot) => {
        viewNb = snapshot.val() + 1;
        firebase.database().ref("/stats").update({
            view: viewNb
        });
        document.querySelector(".viewClass").innerHTML =  `Nombre de vues : ${viewNb}`;
    });
}

function SetData(dataName, data) {
    firebase.database().ref("/stats").update({
        [dataName]: data
    });
}

document.querySelector(".viewClass").addEventListener("click", resetView);
function resetView(){
    let pwd = 'DDforEVER';
    let person = prompt("Please enter your password:", "***");
    if (person == null || person == "") {
      text = "User cancelled the prompt.";
      alert(text);
    } else {
      if (person == pwd) {
        firebase.database().ref("/stats").update({
            view: 0
        });
        document.querySelector(".viewClass").innerHTML =  `Nombre de vues : 0`;
      } else {
        text = "Wrong password!";
        alert(text);
      }
    }

  }
document.querySelector(".adminLink").addEventListener("click", adminShow);
function adminShow() {
    let pwd = 'admin123ADMIN';
    let person = prompt("Please enter your password:", "***");
    if (person == null || person == "") {
      text = "User cancelled the prompt.";
      alert(text);
    } else {
      if (person == pwd) {
        Router.navigate('/admin');
      } else {
        text = "Wrong password!";
        alert(text);
      }
    }
}


// ======== Données des jeux ========
const data = [
    {
        name: 'Zone de recherche de la base',
        released: '2025-10-01',
        background_image: 'images/screen/1.png'
    },
    {
        name: 'Information base',
        released: '2025-03-19',
        background_image: 'images/screen/2.png'
    },
    {
        name: 'Vue de la base',
        released: '2025-11-23',
        background_image: 'images/screen/6.png'
    },
    {
        name: 'Les objectifs',
        released: '2025-02-20',
        background_image: 'images/screen/9.png'
    },
    {
        name: 'Découverte des poissons',
        released: '2025-11-17',
        background_image: 'images/screen/10.png'
    },
    {
        name: 'Plantation',
        released: '2025-11-04',
        background_image: 'images/screen/13.png'
    },
    {
        name: 'Base de l’extérieur',
        released: '2025-09-06',
        background_image: 'images/screen/15.png'
    },
    {
        name: 'Les fonds marins',
        released: '2025-07-03',
        background_image: 'images/screen/17.png'
    },
    {
        name: 'Grotte sous-marine',
        released: '2025-09-27',
        background_image: 'images/screen/20.png'
    }
];


// ======== Initialisation de l'application ========
document.addEventListener("DOMContentLoaded", function () {
    // Sélection des éléments HTML pour les vues
    const helpElement = document.querySelector('.help');
    const gameListElement = document.querySelector('.gameList');
    const aboutElement = document.querySelector('.about');
    const teamElement = document.querySelector('.team');
    const installElement = document.querySelector('.install');
    const dbElement = document.querySelector('.db');
    const dbForm = document.querySelectorAll('.dbform');

    // Vérification si les éléments existent pour éviter d'autres erreurs
    if (!helpElement || !gameListElement || !aboutElement || !teamElement || !installElement || !dbElement) {
        console.error("Un des éléments HTML requis est introuvable !");
        return;
    }

    // Création des instances des vues
    const helpView = new HelpView(helpElement);
    const gameListView = new GameListView(gameListElement);
    const aboutView = new View(aboutElement);
    const teamView = new View(teamElement);
    const installView = new View(installElement);
    const dbView = new View(dbElement);

    // Définition des routes
    Router.routes = [
        { path: '/gameList', view: gameListView, title: 'JEU/APP' },
        { path: '/', view: gameListView, title: 'JEU/APP' },
        { path: '/install', view: installView, title: 'Installation' },
        { path: '/about', view: aboutView, title: 'À propos' },
        { path: '/team', view: teamView, title: 'L\'Equipe' },
        { path: '/help', view: helpView, title: 'Support' },
        { path: '/admin', view: dbView, title: 'Admin' }
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

    UpdateView();

    dbForm.forEach(form => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = event.target.querySelector("input");
            let value = input.value;
            value = value.includes(".") ? parseFloat(value) : parseInt(value);
            SetData(input.name, value);
        });
    });
});
