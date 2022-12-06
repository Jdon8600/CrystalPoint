var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 576,
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

function preload ()
{
    this.load.image('ground_1x1', 'assets2/ground_1x1.png');
    this.load.spritesheet('coin', 'assets2/coin.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('spikes', 'assets2/spikes.png');
    this.load.tilemapTiledJSON('map', 'assets2/map20.JSON');
    this.load.image('player', 'assets2/phaser-dude.png');

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

    jumpSound = this.sound.add('jumpSound');
    mapLevelMusic = this.sound.add('mapLevelMusic');
    mapCompleteSound = this.sound.add('mapCompleteSound');
    pauseSound = this.sound.add('pauseSound');
    deathSound = this.sound.add('deathSound');
    gameOverSound = this.sound.add('gameOverSound');
    

    groundLayer.setCollisionBetween(1, 25);

    // This will set Tile ID (the coin tile) to call the function "hitCoin" when collided with
    coinLayer.setTileIndexCallback(1, hitCoin, this);

    spikeLayer.setTileIndexCallback(27, hitSpike, this);

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

// create a health variable for the player
var health = 4;

// create a function to handle the player hitting a spike
// when the player hits a spike, they lose a health point and are moved back to the start
function hitSpike (player, spike)
{
    health -= 1;
    // play a sound when the player hits a spike
    deathSound = this.sound.add('deathSound');
    deathSound.play();
    player.x = 80;
    player.y = 70;
    updateText();
}

// When the player's health reaches 0, the game ends and a message is displayed
function updateText ()
{
    if (health == 0) {
        text.setText('Game Over');
    } else {
        text.setText('Coins: ' + coinsCollected + ' Lives: ' + health);
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
        '\nCrystals Collected: ' + coinsCollected + '/12' +
        '\nLives: ' + health

    );
}
