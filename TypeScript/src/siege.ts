import gsap from "gsap";
import * as _ from "lodash";

interface Velocity {
  x: number;
  y: number;
}

interface CanvasObj {
  x: number;
  y: number;
  radius: number;
  color: string;
  draw(): void;
}

interface Player extends CanvasObj {}

interface Projectile extends CanvasObj {
  velocity: Velocity;
  update(): void;
}

interface Enemy extends CanvasObj {
  velocity: Velocity;
  update(): void;
}

interface Particle extends CanvasObj {
  velocity: Velocity;
  alpha: number;
  update(): void;
}

//Working Code
const canvas: HTMLCanvasElement = document.querySelector(
  "canvas"
) as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const pointsElem: HTMLSpanElement = document.querySelector(
  "#points"
) as HTMLSpanElement;
const boardPointsElem: HTMLDivElement = document.querySelector(
  "#boardScore"
) as HTMLDivElement;
const startGameBtn: HTMLButtonElement = document.getElementById(
  "startGame"
) as HTMLButtonElement;
const board: HTMLDivElement = document.querySelector(
  ".Board"
) as HTMLDivElement;
let gameStart: boolean = false;

function hideBoard(): void {
  const boardTimeLine: GSAPTimeline = gsap.timeline();
  boardTimeLine
    .to(board, {
      y: -100,
      opacity: 0,
    })
    .set(board, {
      display: "none",
    });
}
function ShowBoard(): void {
  const boardTimeLine: GSAPTimeline = gsap.timeline();
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

class Player implements Player {
  constructor(
    x: number = canvas.width / 2,
    y: number = canvas.height / 2,
    radius: number = 10,
    color: string = "white"
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    if (ctx !== null) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
}

class Projectile implements Projectile {
  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: Velocity
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    if (ctx !== null) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy implements Enemy {
  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: Velocity
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    if (ctx !== null) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
const friction: number = 0.99;

class Particle implements Particle {
  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: Velocity
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    if (ctx !== null) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
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

let projectiles: Projectile[] = [];
let enemies: Enemy[] = [];
let particles: Particle[] = [];
let player: Player = new Player();
let score: number = 0;

function init(): void {
  projectiles = [];
  enemies = [];
  particles = [];
  player = new Player();
  score = 0;
  pointsElem.innerHTML = score.toString();
  boardPointsElem.innerHTML = score.toString();
}

function spawEnemies(): void {
  setInterval(() => {
    const radius: number = Math.random() * (30 - 7) + 7;
    let x: number;
    let y: number;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color: string = `hsl(${Math.random() * 360},50%, 50%)`;

    const angle: number = Math.atan2(
      canvas.height / 2 - y,
      canvas.width / 2 - x
    );

    const velocity: Velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}
let animationID: number;
function animate(): void {
  animationID = requestAnimationFrame(animate);
  if (ctx !== null) {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
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

    const dist: number = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - player.radius - enemy.radius < 1) {
      console.log("END GAME");
      cancelAnimationFrame(animationID);
      boardPointsElem.innerHTML = score.toString();
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
          pointsElem.innerHTML = score.toString();

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
            pointsElem.innerHTML = score.toString();

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
