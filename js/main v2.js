$(document).ready(function() {
    
    // width and height of the screen (camera view)
    var width = 1000;
    var height = 780;
    
    var game = new Phaser.Game(width, height, Phaser.AUTO, "", {preload: 
        preload, create: create, update: update});
    
    function preload() {
        game.load.image("background", "../assets/BackgroundTile1.png");
        game.load.image("blackkilobot", "../assets/blackkilobot.png");
        game.load.image("redkilobot", "../assets/redkilobot.png")
        game.load.image("platform", "../assets/GroundType1.png");
    }
    
    var background;
    
    // KiloBot Status
    var player;
    var kilobots;
    var undiscovered;
    var coords = [];
    var flag = [];
    var hasMoved = false;
    var start = false;
    
    var controls;
    var toggleKilobot;

    var platforms;
    
    //TESTING LARGE LEVEL SIZE
    var levelWidth = 10000000;
    var levelHeight = height;
    
    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        background = game.add.tileSprite(0, 0, levelWidth, levelHeight, "background");
        game.world.setBounds(0, 0, levelWidth, levelHeight);
        
        kilobots = game.add.group();
        kilobots.enableBody = true;

        undiscovered = game.add.group();
        undiscovered.enableBody = true;
        
        // Control init
        controls = game.input.keyboard.createCursorKeys();
        toggleKilobot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
        platforms = game.add.group();

        respawn();
        /*
        // Fill ground with platform type 1
        // Floating "stair" platforms using type 2
        var platformCount = levelWidth/(0.10*width);
        for(var i=0; i<platformCount; i++) {
            // fill ground with platforms (test)
            var ground = platforms.create(i*levelWidth/platformCount, levelHeight-(0.05*height), 'ground');
            // scale = (ratio*dimension)/imageDimensions
            ground.scale.setTo((0.10*width)/600,(0.05*height)/182);
            ground.body.immovable = true;
            
            // fill with ledges (test)
            var platform = platforms.create(i*levelWidth/platformCount, levelHeight-(0.05*(i*4)*height), 'platform');
            platform.scale.setTo((0.10*width)/600,(0.05*height)/212);
            platform.body.immovable = true;
        }
        */

        /*
        // platform generation from text file
        $.get('../assets/levels/level1.txt', function(data) {
            var lines = data.split("\n");
            $.each(lines, function(n, line) {
                var platformData = jQuery.parseJSON(line);
                var x = parseInt(platformData.x);
                var y = parseInt(platformData.y);
                var w = parseInt(platformData.w);
                var h = parseInt(platformData.h);
                var platform = platforms.create(x, y, 'platform');
                platform.scale.setTo(w/600, h/212);
                platform.body.immovable = true;
            });
        });
        */
    }
    
    function update() {
        // player+platform collision
        game.physics.arcade.collide(kilobots, platforms);
        game.physics.arcade.collide(undiscovered, platforms);
        game.physics.arcade.collide(kilobots, undiscovered, pickUp, null, this);

        if(!start) {
            for(var i=0; i<kilobots.children.length; i++) {
                if(kilobots.getAt(i).body.touching.down) {
                    start = true;
                } else {
                    start = false;
                }
            }
        } else {
            for(var i=0; i<kilobots.children.length; i++) {
                kilobots.children[i].body.velocity.x = 0;
            }
            // Move kilobot chain
            for(var i=1; i<kilobots.children.length; i++) {
                if(coords[i-1].length > 1) {
                    if(Math.abs(kilobots.children[i-1].body.x - kilobots.children[i].body.x) > 56 ||
                        Math.abs(kilobots.children[i-1].body.y - kilobots.children[i].body.y) > 42 || flag[i-1]) {
                        var coord = coords[i-1].shift();
                        if(i < kilobots.children.length - 1) {
                            coords[i].push(coord);
                        }
                        game.physics.arcade.moveToXY(kilobots.children[i], coord.x, coord.y, 450, 30);
                        flag[i-1] = true;
                        if(coords[i-1].length == 2) {
                            flag[i-1] = false;
                        }
                    }
                }
            }

            // Move kilobot head
            if (controls.left.isDown) {
                // move left
                kilobots.children[0].body.velocity.x = -450;
                hasMoved = true;
            } else if (controls.right.isDown) {
                // move right
                kilobots.children[0].body.velocity.x = 450;
                hasMoved = true;
            } else {
                // do nothing (idle animation)
                /*
                if (facing != 'idle') {
                    player.animations.stop();
                    if (facing == 'left') {
                        player.frame = 0;
                    } else {
                        player.frame = 5;
                    }
                    facing = 'idle';
                }*/
            }
            
            if (controls.up.isDown && (kilobots.getAt(0).body.onFloor() || kilobots.getAt(0).body.touching.down)) {
                // jump
                kilobots.children[0].body.velocity.y = -550;
                hasMoved = true;
            }

            if(hasMoved) {
                coords[0].push({x:Math.floor(kilobots.children[0].body.x), y:Math.floor(kilobots.children[0].body.y)});
            }

            
            // game over state
            if(kilobots.getAt(0).body.onFloor()) {
                kilobots.removeAll(true);
                undiscovered.removeAll(true);
                respawn();
            }
            
        }
    }

    function respawn() {
        flag = [];
        coords = [];
        hasMoved = false;
        start = false;
        var bot = kilobots.create(50, 400, 'blackkilobot');
        bot.body.collideWorldBounds = true;
        bot.body.gravity.y = 1000;
        bot.body.maxVelocity.y = 650; // maximum jump height is 650
        bot.body.setSize(56, 42, 0, 0);
        //bot.anchor.setTo(0.5, 0.5);
        flag.push(false);
        coords.push([]);
        game.camera.follow(kilobots.getAt(0));

        // generate unfound kilobots
        bot = undiscovered.create(1650, 100, 'redkilobot');
        bot.body.collideWorldBounds = true;
        bot.body.gravity.y = 1000;
        bot.body.setSize(56, 42, 0, 0);

        generatePlatforms();
    }

    function generatePlatforms() {
        // initialize platforms group
        platforms.destroy(true);
        platforms = game.add.group();
        // enable physics on all children of group
        platforms.enableBody = true;

        var prevWidth = 0;
        var prevHeight = 50;
        // spawn platform
        var platform = platforms.create(0, 600, 'platform');
        prevWidth = 200;
        platform.scale.setTo(prevWidth/600, prevHeight/212);
        platform.body.immovable = true;

        // random platform generation
        for(var i=0; i<30; i++) {
            var platformData = platforms.getAt(platforms.length-1);
            var platformX = platformData.body.x + prevWidth;
            var platformY = platformData.body.y;
            console.log(platformX + " " + platformY);

            // random x between 100 and 450
            // random y between 50 and 500
            var nextX = Math.floor(Math.random()*275+100)+platformX;
            var nextY;
            if(platformY < 250) {
                nextY = platformY + Math.floor(Math.random()*450+50);
            } else if(platformY > 650) {
                nextY = platformY - Math.floor(Math.random()*100+50);
            } else {
                if(Math.random() > 0.25) {
                    nextY = platformY - Math.floor(Math.random()*100+50);
                } else {
                    nextY = platformY + Math.floor(Math.random()*125+50);
                }
            }
            prevWidth = Math.floor(Math.random()*200)+50;
            platform = platforms.create(nextX, nextY, 'platform');
            platform.scale.setTo(prevWidth/600, prevHeight/212);
            platform.body.immovable = true;
        }
    }

    function pickUp(player, bot) {
        coords = [];
        coords.push([]);
        hasMoved = false;
        kilobots.add(undiscovered.getAt(0));
        undiscovered.remove(bot, true);
    }
});