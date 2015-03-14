$(document).ready(function() {
    
    // width and height of the screen (camera view)
    var width = 1000;
    var height = 750;
    
    var game = new Phaser.Game(width, height, Phaser.AUTO, "", {preload: 
        preload, create: create, update: update});

    /*var sound = new Phaser.Sound(game, key, volume, loop, soundLoop, "",
        {preload: preload, create:create, update:update}); */
    
    function preload() {
        game.load.image("background", "../assets/BackgroundTile1.png");

        game.load.image("blackkilobot", "../assets/KILOBLACK.png");
        game.load.image("redkilobot", "../assets/KILORED.png");
        game.load.image("greenkilobot", "../assets/KILOGREEN.png");
        game.load.image("bluekilobot", "../assets/KILOBLUE.png");

        game.load.image("platformblack", "../assets/GroundTypeBlack.png");
        game.load.image("platformred", "../assets/GroundTypeRed.png");
        game.load.image("platformgreen", "../assets/GroundTypeGreen.png");
        game.load.image("platformblue", "../assets/GroundTypeBlue.png");

        game.load.image("clock", "../assets/clock.png");

        game.load.audio("beat", "../assets/beat.aud");
        //game.load.audio("punch", "../assets/punch.mp3");
    }
    
    var background;
    var startTime;
    
    // KiloBot Status
    var kilobots;
    var bot;
    var undiscovered;
    var coords = [];
    var flag = [];
    var hasMoved = false;
    var start = false;
    
    // user controls
    var controls;
    var toggleKilobot;
    var toggleDelay = 0;

    // platform variables
    var platformData;
    var platformsBlack;
    var platformsRed;
    var platformsBlue;
    var platformsGreen;
    var nextX;
    var nextY;
    var prevWidth;
    var prevHeight;

    // Time and Score Variables
    var timer = 60;
    var time;
    var points = 0;
    var maxDistance = 0;
    var score;
    //var instruction;

    // TimerObject Variables
    var incTime;
    var newTime;
    var timeCounter = 0;
    
    //LARGE LEVEL SIZE
    var levelWidth = 10000000;
    var levelHeight = height;

    // display wrap around text
   /* var directions = "Press SPACEBAR to start the game. Use LEFT and RIGHT arrow keys to move, and UP arrow key to jump. Pressing SPACEBAR switches the head Kilobot, and you can only see colored platforms depending on the head Kilobot.";
    var style = {font: "30px Arial", fill: "#2C2F9C", align: "center"};
    var text = game.add.text(game.world.centerX, game.world.centerY, directions, style);
    text.anchor.set(0.5);
    text.wordWrap = true;
    text.wordWrapWidth = window.innerWidth - 50;*/
    
    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        background = game.add.tileSprite(0, 0, levelWidth, levelHeight, "background");
        game.world.setBounds(0, 0, levelWidth, levelHeight);
        
        kilobots = game.add.group();
        kilobots.enableBody = true;

        undiscovered = game.add.group();
        undiscovered.enableBody = true;

        newTime = game.add.group();
        newTime.enableBody = true;

        // initialize platforms group
        platformsBlack = game.add.group();
        platformsBlue = game.add.group();
        platformsRed = game.add.group();
        platformsGreen = game.add.group();

        // enable physics on all children of group
        platformsBlack.enableBody = true;
        platformsRed.enableBody = true;
        platformsBlue.enableBody = true;
        platformsGreen.enableBody = true;
        
        // Control init
        controls = game.input.keyboard.createCursorKeys();
        toggleKilobot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        time = game.add.text(0, 0, "Time Left: " + timer + " seconds", {
            font: "30px Arial",
            fill: "#2C2F9C"
        });
        time.fixedToCamera = true;
        time.cameraOffset.setTo(20, 20);

        score = game.add.text(0, 0, "Score: " + points, {
            font: "30px Arial",
            fill: "#2C2F9C"
        });
        score.fixedToCamera = true;
        score.cameraOffset.setTo(20, 60);

       /* instruction = game.add.text(0, 0, "Instructions: Press SPACEBAR to start the game. Use LEFT and RIGHT arrow keys to move, and UP arrow key to jump. Pressing SPACEBAR switches the head Kilobot, and you can only see colored platforms depending on the head Kilobot.", {
            font: "24px Arial",
            fill: "#2C2F9C"
        }); 
        instruction.fixedToCamera = false;
        //instruction.cameraOffset.setTo(20, 100);*/

        game.music = game.add.audio('beat');
		game.music.loop = true;
        game.music.play();

        respawn();
    }
    
    function update() {
        // player+platform collision
        game.physics.arcade.collide(kilobots, platformsBlack);
        game.physics.arcade.collide(kilobots, platformsRed);
        game.physics.arcade.collide(kilobots, platformsBlue);
        game.physics.arcade.collide(kilobots, platformsGreen);
        game.physics.arcade.collide(undiscovered, platformsBlack);
        game.physics.arcade.collide(undiscovered, platformsRed);
        game.physics.arcade.collide(undiscovered, platformsBlue);
        game.physics.arcade.collide(undiscovered, platformsGreen);
        game.physics.arcade.collide(newTime, platformsBlack);
        game.physics.arcade.collide(newTime, platformsRed);
        game.physics.arcade.collide(newTime, platformsBlue);
        game.physics.arcade.collide(newTime, platformsGreen);
        game.physics.arcade.collide(kilobots, undiscovered, pickUp, null, this);
        game.physics.arcade.collide(kilobots, newTime, pickTimer, null, this);

        if(!start) {
            for(var i=0; i<kilobots.children.length; i++) {
                if(kilobots.getAt(i).body.touching.down && toggleKilobot.isDown) {
                    start = true;
                    startTime = game.time.totalElapsedSeconds();
                } else {
                    /*var centerX = (window.width)/2;
                    var centerY = (window.height)/2;
                    var directions = "Press SPACEBAR to start the game. Use LEFT and RIGHT arrow keys to move, and UP arrow key to jump. Pressing SPACEBAR switches the head Kilobot, and you can only see colored platforms depending on the head Kilobot.";
                    var style = {font: "30px Arial", fill: "#2C2F9C", align: "center"};
                    var text = game.add.text(game.world.centerX, game.world.centerY, directions, style);
                    directions.fixedToCamera = false;
                    text.anchor.set(0.5);
                    text.wordWrap = true;
                    text.wordWrapWidth = window.innerWidth - 50;*/
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

            var onGround = false;
            // shuffle kilobots
            if(kilobots.getAt(0).body.x < kilobots.getAt(kilobots.children.length-1).body.x + 5) {
                for(var k=0; k<kilobots.children.length; k++) {
                    onGround = kilobots.getAt(k).body.touching.down;
                }
                if(toggleKilobot.isDown && onGround && game.time.now > toggleDelay) {
                    var bot = kilobots.getAt(0);
                    kilobots.remove(kilobots.getAt(0));
                    kilobots.add(bot);
                    game.camera.follow(kilobots.getAt(0));
                    toggleDelay = game.time.now + 500;
                    console.log(kilobots.getAt(0).key);

                    if(kilobots.getAt(0).key == 'blackkilobot'){
                        platformsBlack.alpha = 1;
                        platformsRed.alpha = 0;
                        platformsGreen.alpha = 0;
                        platformsBlue.alpha = 0;
                    }else if(kilobots.getAt(0).key == 'redkilobot'){
                        platformsBlack.alpha = 0;
                        platformsRed.alpha = 1;
                        platformsGreen.alpha = 0;
                        platformsBlue.alpha = 0;
                    }else if(kilobots.getAt(0).key == 'greenkilobot'){
                        platformsBlack.alpha = 0;
                        platformsRed.alpha = 0;
                        platformsGreen.alpha = 1;
                        platformsBlue.alpha = 0;
                    }else if(kilobotos.getAt(0).key == 'bluekilobot'){
                        platformsBlack.alpha = 0;
                        platformsRed.alpha = 0;
                        platformsGreen.alpha = 0;
                        platformsBlue.alpha = 1;
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
            }
            
            if (controls.up.isDown && (kilobots.getAt(0).body.onFloor() || kilobots.getAt(0).body.touching.down)) {
                // jump
                kilobots.children[0].body.velocity.y = -550;
                hasMoved = true;
            }

            if(hasMoved) {
                coords[0].push({x:Math.floor(kilobots.children[0].body.x), y:Math.floor(kilobots.children[0].body.y)});
            }

            // decrease time
            // need to fix this check statement to something better
            if(((game.time.totalElapsedSeconds()-startTime)-timeCounter) > (61-timer)) {
                updateTime();
            }

            /*if(toggleKilobot.isdown) {
                game.music.punch = game.add.audio('punch');
                game.music.punch.play();
            }*/


            // update score
            updateScore(kilobots.children[0].body.x);

            // game over state
            if(kilobots.getAt(0).body.onFloor() || timer == 0) {
                kilobots.removeAll(true);
                undiscovered.removeAll(true);
                newTime.removeAll(true);
                platformsBlack.removeAll(true);
                platformsRed.removeAll(true);
                platformsBlue.removeAll(true);
                platformsGreen.removeAll(true);
                respawn();
            }
        }
    }

    function respawn() {
        flag = [];
        coords = [];
        hasMoved = false;
        start = false;
        bot = kilobots.create(50, 400, 'blackkilobot');
        bot.body.collideWorldBounds = true;
        bot.body.gravity.y = 1000;
        bot.body.maxVelocity.y = 650; // maximum jump height is 650
        bot.body.setSize(56, 42, 0, 0);
        //bot.anchor.setTo(0.5, 0.5);
        flag.push(false);
        coords.push([]);
        game.camera.follow(kilobots.getAt(0));

        // reset time
        timer = 61;
        updateTime();
        game.time.reset();
        timeCounter = 0;

        // reset points
        points = 0;
        maxDistance = 0;

        platformsRed.alpha = 0;
        platformsGreen.alpha = 0;
        platformsBlue.alpha = 0;
        platformsBlack.alpha = 1;
        generatePlatforms();
    }

    function generateKilobot(color, x, y) {
        // generate unfound kilobots
        bot = undiscovered.create(x, y, color);
        bot.body.collideWorldBounds = true;
        bot.body.gravity.y = 1000;
        bot.body.setSize(56, 42, 0, 0);
    }

    function generateIncTime(x, y){
        incTime = newTime.create(x, y, 'clock');
        incTime.body.collideWorldBounds = true;
        incTime.body.gravity.y = 1000;
        incTime.body.setSize(56, 64, 0, 0);
    }

    function generatePlatforms() {
        prevWidth = 0;
        prevHeight = 50;
        // spawn platform
        var platform = platformsBlack.create(0, 500, 'platformblack');
        prevWidth = 200;
        platform.scale.setTo(prevWidth/600, prevHeight/182);
        platform.body.immovable = true;

        // random platform generation
        makePlatforms(100);
    }

    function makePlatforms(num) {
        
        var color = 'platformblack';
        platformData = platformsBlack.getAt(platformsBlack.length-1);
        var rand;
        var platform;

        for(var i=0; i<num; i++) {
            var platformX = platformData.body.x + prevWidth;
            var platformY = platformData.body.y;
            console.log(platformX + " " + platformY);

            // random x between 100 and 450
            // random y between 50 and 500
            nextX = Math.floor(Math.random()*275+100)+platformX;
            var reduction = 0;
            if(nextX > 350) {
                reduction = -25;
            }
            if(platformY < 250) {
                nextY = platformY + Math.floor(Math.random()*450+50+reduction);
            } else if(platformY > 650) {
                nextY = platformY - Math.floor(Math.random()*100+50+reduction);
            } else {
                if(Math.random() > 0.25) {
                    nextY = platformY - Math.floor(Math.random()*100+50+reduction);
                } else {
                    nextY = platformY + Math.floor(Math.random()*125+50+reduction);
                }
            }
            prevWidth = Math.floor(Math.random()*200)+50;

            // Pick color of next platform
            rand = Math.random();
            if(i>4 && i<15) {
                if(rand < 0.5) {
                    color = 'platformblack';
                } else {
                    color = 'platformred';
                }
            } else if(i>=15 && i<35) {
                if(rand < 0.333) {
                    color = 'platformblack';
                } else if(rand >= 0.333 && rand < 0.666) {
                    color = 'platformred';
                } else {
                    color = 'platformgreen';
                }
            } else if(i >= 35) {
                if(rand < 0.25) {
                    color = 'platformblack';
                } else if(rand >= 0.25 && rand < 0.5) {
                    color = 'platformred';
                } else if(rand >= 0.5 && rand < 0.75) {
                    color = 'platformgreen';
                } else {
                    color = 'platformblue';
                }
            }

            // Make that platform and add to correct group
            if(color == "platformblack") {
                platform = platformsBlack.create(nextX, nextY, color);
                platformData = platformsBlack.getAt(platformsBlack.length-1);
            } else if (color == "platformred") {
                platform = platformsRed.create(nextX, nextY, color);
                platformData = platformsRed.getAt(platformsRed.length-1);
            } else if (color == "platformgreen") {
                platform = platformsGreen.create(nextX, nextY, color);
                platformData = platformsGreen.getAt(platformsGreen.length-1);
            } else if (color == "platformblue") {
                platform = platformsBlue.create(nextX, nextY, color);
                platformData = platformsBlue.getAt(platformsBlue.length-1);
            }
            platform.scale.setTo(prevWidth/600, prevHeight/182);
            platform.body.immovable = true;

            // Generate kilobot at platform i
            if(i == 4) {
                generateKilobot('redkilobot', nextX, nextY-50);
            }

            if(i == 14) {
                generateKilobot('greenkilobot', nextX, nextY-50);
            }

            if(i == 34) {
                generateKilobot('bluekilobot', nextX, nextY-50);
            }

            // Generate time at platform i
            if((i % 10) == 0 && i != 0){
                generateIncTime(nextX, nextY-100);
            }


        }
    }

    function pickUp(player, bot) {
        hasMoved = false;
        kilobots.add(undiscovered.getAt(0));
        undiscovered.remove(bot, true);
        coords = [];
        for(var i=0; i<kilobots.children.length; i++) {
            coords.push([]);
        }
    }

    function pickTimer(player, incTime){
        newTime.remove(incTime, true);
        timer += 4;
        timeCounter += 4;
        updateTime();    
    }

    function updateTime() {
        timer -= 1;
        time.setText("Time Left: " + timer + " seconds");
    }

    function updateScore(kilobotX) {
        if(kilobotX > maxDistance) {
            maxDistance = kilobotX;
            points = kilobotX;
            score.setText("Score: " + (Math.floor(points)-50));
        }
    }

   /*function info() {
        if(!start) {
            information.setText("Instructions: Press SPACEBAR to start the game.
            Use LEFT and RIGHT arrow keys to move, and UP arrow key to jump. 
            Pressing SPACEBAR switches the head Kilobot, and you can only see colored platforms depending on the head Kilobot.");

        }

    }*/
});