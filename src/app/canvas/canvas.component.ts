import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  config = {
              type: Phaser.AUTO,
              width: 800,
              height: 600,
              physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 },
                    debug: false
                }
              },
              scene:[MainScene]
            };

  game: Phaser.Game;
  
  constructor() {
   
   
  }

  ngOnInit(): void {
    this.game = new Phaser.Game(this.config);
  }
}


// escena principal para el juego aqui va su propia programacion 
class MainScene extends Phaser.Scene{
  platforms;
  gameSettings: any;
  player;
  defaultSettings: any = [
    { setting: 'music', value: true },
    { setting: 'sfx', value: true }
  ];
  cursors;
  stars;
  score = 0;
  scoreText;
  bombs;

  constructor() {
    super({ key: 'main' });
  }

  preload() {
    this.load.image('sky', 'assets/recursos/sky.png');
    this.load.image('ground', 'assets/recursos/platform.png');
    this.load.image('star', 'assets/recursos/star.png');
    this.load.image('bomb', 'assets/recursos/bomb.png');
    this.load.spritesheet('dude', 
        'assets/recursos/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
  }

  //En esta funcion se crean todos los recursos del escenario
  create() {
    //añadir un recurso (imagen de fondo)
    this.add.image(400, 300, 'sky');
    //Añadir el recurso de las plataformas y dibujarlas 
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    // Añadir las propiedades del jugador
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true); 
    // Añadir las animaciones de los onjetos (Personaje)
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
    // Añade la gravedad del objeto
    this.player.body.setGravityY(350)
    // Añade las coliciones ente objetos 
    this.physics.add.collider(this.player, this.platforms);
    // Añadimos los objetos a recoger en este caso son las estrellas 
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });
    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    // Asignamos los datos en la vatiable scoretext 
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });
    // Añadimos las bombas
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
  }

  

  override update() {
    this.cursors = this.input.keyboard.createCursorKeys();
    if (this.cursors.left.isDown){
      this.player.setVelocityX(-160);

      this.player.anims.play('left', true);
    }else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play('right', true);
    }else {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }
  }

  // Funciones Extras, programar los eventos que se necesitan
  collectStar (player, star){
    star.disableBody(true, true);
    //Actualizamos el 
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    if (this.stars.countActive(true) === 0) {
        this.stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        let bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
  }

  hitBomb (player, bomb){
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    //gameOver = true;
  }
}