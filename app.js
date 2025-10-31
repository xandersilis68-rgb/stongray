const canvas = document.getElementById('tank-canvas');
const ctx = canvas.getContext('2d');

let rays = [];
let plants = [];
let achievements = [];

class Stingray {
    constructor(species) {
        this.species = species.name;
        this.size = species.baseSize;
        this.color = species.colors[Math.floor(Math.random() * species.colors.length)];
        this.sex = Math.random() > 0.5 ? 'Male' : 'Female';
        this.age = 0;
        this.health = 100;
        this.hunger = 0;
        this.personality = PERSONALITY_TRAITS[Math.floor(Math.random() * PERSONALITY_TRAITS.length)];
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
    }

    feed() {
        this.hunger = Math.max(0, this.hunger - 20);
        this.health = Math.min(100, this.health + 5);
    }

    ageOneTick() {
        this.age += 0.01;
        this.hunger += 0.05;
        if (this.hunger > 50) this.health -= 0.05;
    }
}

class Plant {
    constructor(species) {
        this.species = species.name;
        this.size = 5;
        this.growthRate = species.growthRate;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
    }

    grow() {
        this.size += this.growthRate;
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, 5, this.size);
        ctx.fillStyle = 'green';
        ctx.fill();
    }
}

function updateStats() {
    document.getElementById('ray-count').innerText = rays.length;
    document.getElementById('plant-count').innerText = plants.length;
}

function updateAchievements(text) {
    if (!achievements.includes(text)) {
        achievements.push(text);
        const ul = document.getElementById('achievements');
        const li = document.createElement('li');
        li.textContent = text;
        ul.appendChild(li);
    }
}

document.getElementById('add-ray').addEventListener('click', () => {
    const species = STINGRAY_SPECIES[Math.floor(Math.random() * STINGRAY_SPECIES.length)];
    rays.push(new Stingray(species));
    updateStats();
});

document.getElementById('feed-ray').addEventListener('click', () => {
    rays.forEach(ray => ray.feed());
});

document.getElementById('add-plant').addEventListener('click', () => {
    const species = PLANT_SPECIES[Math.floor(Math.random() * PLANT_SPECIES.length)];
    plants.push(new Plant(species));
    updateStats();
});

document.getElementById('clean-tank').addEventListener('click', () => {
    rays.forEach(ray => ray.health = Math.min(100, ray.health + 10));
});

document.getElementById('save-game').addEventListener('click', () => {
    localStorage.setItem('rays', JSON.stringify(rays));
    localStorage.setItem('plants', JSON.stringify(plants));
    localStorage.setItem('achievements', JSON.stringify(achievements));
    alert('Game Saved!');
});

document.getElementById('load-game').addEventListener('click', () => {
    const savedRays = JSON.parse(localStorage.getItem('rays') || '[]');
    const savedPlants = JSON.parse(localStorage.getItem('plants') || '[]');
    const savedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');

    rays = savedRays.map(r => Object.assign(new Stingray({name:r.species, baseSize:r.size, colors:[r.color]}), r));
    plants = savedPlants.map(p => Object.assign(new Plant({name:p.species, growthRate:p.growthRate}), p));
    achievements = savedAchievements;

    const ul = document.getElementById('achievements');
    ul.innerHTML = '';
    achievements.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        ul.appendChild(li);
    });

    updateStats();
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    plants.forEach(plant => {
        plant.grow();
        plant.draw();
    });

    rays.forEach(ray => {
        ray.move();
        ray.ageOneTick();
        ray.draw();
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();