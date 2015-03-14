$(document).ready(function() {
    
    // width and height of the screen (camera view)
    var width = $(window).width();
    var height = $(window).height();
    
    var game = new Phaser.Game(width, height, Phaser.AUTO, "", {preload: 
        preload, create: create, update: update});
    
    function preload() {
        game.load.image("background", "../assets/BackgroundTile1.png");
        game.load.image("kilobot", "../assets/KiloBot.png");
        game.load.image("ground", "../assets/GroundType1.png");
        game.load.image("platform", "../assets/ground.png"); // TEMP PLATFORM
        game.load.image("enemy", "../assets/dead.png");
    }
    
    var background;
    
    // KiloBot Status
    var player;
    var kilobots;
    var enemy;
    var coords = [];
    var flag = [];
    var hasMoved = false;
    var start = false;
    
    var controls;
    //var jump;
    //var jumpTimer = 0;
    var platforms;
    
    //TESTING LARGE LEVEL SIZE
    var levelWidth = width*3;
    var levelHeight = height*3;
    
    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        background = game.add.tileSprite(0, 0, levelWidth, levelHeight, "background");
        game.world.setBounds(0, 0, levelWidth, levelHeight);
        //game.physics.arcade.gravity.y = 300; (if you want everything in the game to fall)
        
        /*
        player = game.add.sprite(32, 320, "kilobot");
        // Enable physics engine on the player
        game.physics.enable(player, Phaser.Physics.ARCADE);
        // Enable camera follow on player
        game.camera.follow(player);
        player.body.collideWorldBounds = true;
        player.body.gravity.y = 1000;
        // maximum jump height is 650
        player.body.maxVelocity.y = 650;
        player.body.setSize(56, 42, 0, 0);
        player.anchor.setTo(0.5, 0.5);
        */
        
        kilobots = game.add.group();
        kilobots.enableBody = true;
        for(var i=0; i<5; i++) {
            var bot = kilobots.create(50, 1400-42*i, 'kilobot');
            bot.body.collideWorldBounds = true;
            bot.body.gravity.y = 1000;
            bot.body.maxVelocity.y = 650; // maximum jump height is 650
            bot.body.setSize(56, 42, 0, 0);
            //bot.anchor.setTo(0.5, 0.5);
            flag.push(false);
            coords.push([]);
        }
        
        enemy = game.add.group(); // code for adding enemy to group
        enemy.enableBody = true;
        for(i = 1; i < 3; i++) {
        	var vil = enemy.create(300, 1400-42*i, 'enemy');
        	vil.body.collideWorldBounds = true;
        	vil.body.gravity.y = 1000;
        	vil.body.maxVelocity.y = 200;
        	vil.body.setSize(56, 42, 0, 0);
        }
        // create the enemy 
        enemysprite = this.add.sprite(this.world.randomX, 450, 'enemy');
        enemysprite.animations.add('walk');
        this.physics.arcade.enable(enemysprite);
        enemysprite.enableBody = true;
        enemysprite.body.bounce.y = 0.2;
        enemysprite.body.gravity.y = 1000;
        game.time.events.repeat(Phaser.Timer.SECOND * 3, 10, moveEnemy, game);
        
        // Follow the first kilobot
        game.camera.follow(kilobots.getAt(0));
        
        // Control init
        controls = game.input.keyboard.createCursorKeys();
        //jump = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        // initialize platforms group
        platforms = game.add.group();
        // enable physics on all children of group
        platforms.enableBody = true;
        
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
    }
    function moveEnemy() {
    	enemymover = game.rnd.integerInRange(1,3);
    	if(enemymover == 1) {
    		enemysprite.body.velocity.x = 100;
    		enemysprite.animations.play('walk', 20, true);
    	}
    	else if(enemymover == 2) {
    		enemysprite.body.velocity.x = 100;
    		enemysprite.animations.play('walk', 20, true);
    	}
    	else {
    		enemysprite.body.velocity.x = 0;
    		enemysprite.animations.stop('walk', 20, true);
    	}
    	
    }
    
    function update() {
        // player+platform collision
        // game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(kilobots, platforms);
        
        if(!start) {
            for(var i=0; i<kilobots.children.length; i++) {
                if(kilobots.getAt(i).body.touching.down) {
                    start = true;
                } else {
                    start = false;
                }
            }
        } else {
            /*
            var prevX = Math.floor(kilobots.children[0].body.x);
            var prevY = Math.floor(kilobots.children[0].body.y);
            */
            // player.body.velocity.x = 0;
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
                kilobots.children[0].body.velocity.y = -650;
                hasMoved = true;
            }

            if(hasMoved) {
                coords[0].push({x:Math.floor(kilobots.children[0].body.x), y:Math.floor(kilobots.children[0].body.y)});
            }
        }
    }
});