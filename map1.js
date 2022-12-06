var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 576,
    autoCenter: true,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 } }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var map;
var cursors;
var debugGraphics;
var text;
var player;
var showDebug = false;
var groundLayer;
var coinLayer;
var spikeLayer;
var coinsCollected = 0;
var coinCollectSound;
var mapLevelMusic;
var mapCompleteSound;
var pauseSound;
var pause = false;
var jumpSound;
var deathSound;
var gameOverSound;
var restartLevelButton;
var returnMenuButton;
var musicButton;
var resumeGameButton;
var pauseGameButton;
var health = 3;
var gamePaused = false;

function preload ()
{
    this.load.image('ground_1x1', 'assets2/ground_1x1.png');
    this.load.spritesheet('coin', 'assets2/coin.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('spikes', 'assets2/spikes.png');
    this.load.tilemapTiledJSON('map', 'assets2/map10.JSON');
    this.load.image('player', 'assets2/phaser-dude.png');

    // load restart level button, return to menu button, music button, resume game button, pause game button
    this.load.image('restartLevelButton', 'assets2/restartLevelButton4.png');
    this.load.image('returnMenuButton', 'assets2/returnMenuButton2.png');
    this.load.image('musicButton', 'assets2/musicButton2.png');
    this.load.image('resumeGameButton', 'assets2/resumeGameButton3.png');
    this.load.image('pauseGameButton', 'assets2/pauseGameButton2.png');

    this.load.audio('coinCollectSound', 'assets2/coinCollectSound.mp3');
    this.load.audio('mapLevelMusic', 'assets2/mapLevelMusic.mp3');
    this.load.audio('mapCompleteSound', 'assets2/mapCompleteSound.mp3');
    this.load.audio('pauseSound', 'assets2/pauseSound.mp3');
    this.load.audio('jumpSound', 'assets2/jumpSound.mp3');
    this.load.audio('deathSound', 'assets2/deathSound.mp3');
    this.load.audio('gameOverSound', 'assets2/gameOverSound.mp3');

}

function create ()
{
    /*map = this.make.tilemap({ key: 'map' });
    var groundTiles = map.addTilesetImage('ground_1x1');
    var coinTiles = map.addTilesetImage('coin');
    var spikeTiles = map.addTilesetImage('spikes');

    var backgroundLayer = map.createStaticLayer('Background Layer', groundTiles, 0, 0);
    var groundLayer = map.createStaticLayer('Ground Layer', groundTiles, 0, 0);
    var coinLayer = map.createDynamicLayer('Coin Layer', coinTiles, 0, 0);
    var spikeLayer = map.createStaticLayer('Spike Layer', spikeTiles, 0, 0);*/
    map = this.make.tilemap({ key: 'map' });
    var groundTiles = map.addTilesetImage('ground_1x1');
    var coinTiles = map.addTilesetImage('coin');
    var spikeTiles = map.addTilesetImage('spikes');

    var backgroundLayer = map.createStaticLayer('Background Layer', groundTiles, 0, 0);
    var groundLayer = map.createStaticLayer('Ground Layer', groundTiles, 0, 0);
    var spikeLayer = map.createDynamicLayer('Spike Layer', spikeTiles, 0, 0);
    var coinLayer = map.createDynamicLayer('Coin Layer', coinTiles, 0, 0);

    // Load sounds
    music = this.sound.add('mapLevelMusic');
    music.play();

    // when the musicButton is clicked, stop playing the music, if it is pressed again, play the music
    musicButton = this.add.image(750, 50, 'musicButton').setInteractive();
    musicButton.on('pointerdown', function (event) {
        if (music.isPlaying) {
            music.stop();
        } else {
            music.play();
        }
    });

    // create a function pause that stops the game from updating and rendering
    function pause(context) {
        context.scene.pause();
        gamePaused = true;
    }

    // create a function resume that resumes the game from updating and rendering
    function resume(context) {
        context.scene.resume();
        gamePaused = false;
    }

    // when the pauseGameButton is clicked, pause the game
    pauseGameButton = this.add.image(700, 50, 'pauseGameButton').setInteractive();
    pauseGameButton.on('pointerdown', function (event) {
        pause(this);
    });

    // when the resumeGameButton is clicked, resume the game

    resumeGameButton = this.add.image(650, 50, 'resumeGameButton').setInteractive();
    resumeGameButton.on('pointerdown', function (event) {
        resume(this);
    });


    // when the restartLevelButton is clicked, restart the level by reloading the page
    restartLevelButton = this.add.image(600, 50, 'restartLevelButton').setInteractive();
    restartLevelButton.on('pointerdown', function (event) {
        window.location.reload();
    });


    // when the returnMenuButton is clicked, return to the index.html page
    returnMenuButton = this.add.image(550, 50, 'returnMenuButton').setInteractive();
    returnMenuButton.on('pointerdown', function (event) {
        window.location.href = "index.html";
    });

    // the buttons should be located on top right of the screen and should follow the camera
    musicButton.setScrollFactor(0);
    pauseGameButton.setScrollFactor(0);
    resumeGameButton.setScrollFactor(0);
    restartLevelButton.setScrollFactor(0);
    returnMenuButton.setScrollFactor(0);

    // make the restartLevel button a little smaller
    restartLevelButton.setScale(0.8);


    jumpSound = this.sound.add('jumpSound');
    mapLevelMusic = this.sound.add('mapLevelMusic');
    mapCompleteSound = this.sound.add('mapCompleteSound');
    pauseSound = this.sound.add('pauseSound');
    deathSound = this.sound.add('deathSound');
    gameOverSound = this.sound.add('gameOverSound');
    
    groundLayer.setCollisionBetween(1, 25);

    // This will set Tile ID (the coin tile) to call the function "hitCoin" when collided with
    coinLayer.setTileIndexCallback(27, hitCoin, this);

    spikeLayer.setTileIndexCallback(26, hitSpike, this);

    // This will set the map location (2, 0) to call the function "hitSecretDoor" Un-comment this to
    // be jump through the ceiling above where the player spawns. You can use this to create a
    // secret area.
    //groundLayer.setTileLocationCallback(2, 0, 1, 1, hitSecretDoor, this);

    //

    player = this.physics.add.sprite(80, 70, 'player') 
        .setBounce(0.0);

    // We want the player to physically collide with the ground, but the coin layer should only
    // trigger an overlap so that collection a coin doesn'td kill player movement.
    this.physics.add.collider(player, groundLayer);
    this.physics.add.overlap(player, coinLayer);
    this.physics.add.collider(player, spikeLayer, hitSpike, null, this);


    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels); // Set the camera bounds to be the size of the map
    this.cameras.main.startFollow(player); // Make the camera follow the player

    debugGraphics = this.add.graphics();

    this.input.keyboard.on('keydown-C', function (event)
    {
        showDebug = !showDebug;
        drawDebug();
    });

    cursors = this.input.keyboard.createCursorKeys();

    text = this.add.text(16, 16, '', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    text.setScrollFactor(0);
    updateText();
}


function hitCoin (sprite, tile)
{
    //remove the tile/coin
   // coinLayer.removeTileAt(tile.x, tile.y);
    map.removeTileAt(tile.x, tile.y, true, coinLayer);
    //Play sound when you collect a coin
    coinCollectSound = this.sound.add('coinCollectSound');
    coinCollectSound.play();

    coinsCollected += 1;
    updateText();

    // Return true to exit processing collision of this tile vs the sprite - in this case, it
    // doesn't matter since the coin tiles are not set to collide.
    return false;

}



// create a function to handle the player hitting a spike
// when the player hits a spike, they lose a health point and are moved back to the start
function hitSpike (player, spike)
{
    health -= 1;
    // play a sound when the player hits a spike
    deathSound = this.sound.add('deathSound');
    deathSound.play();
    // move the player back to the start
    player.x = 80; 
    player.y = 70; 
    updateText();
    // if the player has no health left, end the game
    if (health == 0)
    {
        gameOver();
    }


}

// When the player's health reaches 0, the game ends and a message is displayed
function updateText ()
{
    if (health == 0) {
        text.setText('Game Over');
    } else {
        text.setText('Coins: ' + coinsCollected + ' Health: ' + health);
    }
}


function update (time, delta) 
{
    // Horizontal movement
    player.body.setVelocityX(0);
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-200);
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(200);
    }

    // Jumping
    if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor())
    {
        player.body.setVelocityY(-300);
        //play sound when you jump and reduce the volume
        jumpSound = this.sound.add('jumpSound');
        jumpSound.play();
        

    }
}

function drawDebug ()
{
    debugGraphics.clear();

    if (showDebug)
    {
        // Pass in null for any of the style options to disable drawing that component
        groundLayer.renderDebug(debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
        });
    }

    updateText();
}

function updateText ()
{
    text.setText(
        'Arrow keys to move. Space to jump' +
        '\nCrystals collected: ' + coinsCollected + '/10' +
        '\nLives: ' + health
    );
}
