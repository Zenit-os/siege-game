const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const pointsElem = document.querySelector("#points");
const boardPointsElem = document.querySelector("#boardScore");
const startGameBtn = document.getElementById("startGame");
const board = document.querySelector(".Board");
let gameStart = false;

function hideBoard() {
  const boardTimeLine = gsap.timeline();
  boardTimeLine
    .to(board, {
      y: -100,
      opacity: 0,
    })
    .set(board, {
      display: "none",
    });
}
function ShowBoard() {
  const boardTimeLine = gsap.timeline();
  boardTimeLine
    .set(board, {
      display: "block",
    })
    .set(".Board .score", {
      display: "block",
    })
    .to(board, {
      y: 0,
      opacity: 1,
    });
}

class Player {
  constructor(
    x = canvas.width / 2,
    y = canvas.height / 2,
    radius = 10,
    color = "white"
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

let projectiles = [];
let enemies = [];
let particles = [];
let player = new Player();
let score = 0;

function init() {
  projectiles = [];
  enemies = [];
  particles = [];
  player = new Player();
  score = 0;
  pointsElem.innerHTML = score;
  boardPointsElem.innerHTML = score;
}

function spawEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 7) + 7;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360},50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}
let animationID;
function animate() {
  animationID = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
    projectile.update();

    //Remove from egdes of screen
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y - projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - player.radius - enemy.radius < 1) {
      console.log("END GAME");
      cancelAnimationFrame(animationID);
      boardPointsElem.innerHTML = score;
      gameStart = false;
      ShowBoard();
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //colision detection. Projectile touch enemy
      if (dist - projectile.radius - enemy.radius < 1) {
        //Create exlopsions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 5),
                y: (Math.random() - 0.5) * (Math.random() * 5),
              }
            )
          );
        }
        if (enemy.radius - 10 >= 10) {
          //increse our score after shrink
          score += 10;
          pointsElem.innerHTML = score;

          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          setTimeout(() => {
            //increse our score after eliminate
            score += 25;
            pointsElem.innerHTML = score;

            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

addEventListener("click", (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };

  if (gameStart === true) {
    projectiles.push(
      new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
    );
  }
});

//Start Game
startGameBtn.addEventListener("click", () => {
  init();
  hideBoard();
  setTimeout(() => {
    gameStart = true;
  }, 0);
  animate();
  spawEnemies();
});
