$(document).ready(function() {
    
    // width and height of the screen (camera view)
    var width = 1200;
    var height = 750;
    
    var game = new Phaser.Game(width, height, Phaser.AUTO, "", {preload: 
        preload, create: create, update: update});
    
    function preload() {
        // preload loading screen background

        game.load.image("blackbackground", "../assets/BackgroundTileBLACKTINT.png");
        game.load.image("redbackground", "../assets/BackgroundTileREDTINT.png");
        game.load.image("greenbackground", "../assets/BackgroundTileGREENTINT.png");
        game.load.image("bluebackground", "../assets/BackgroundTileBLUETINT.png");
        game.load.image("mainmenu", "../assets/KiloMenu.png");
        game.load.image("instruction", "../assets/Instructions.png");


        game.load.image("blackkilobot", "../assets/KILOBLACK.png");
        game.load.image("redkilobot", "../assets/KILORED.png");
        game.load.image("greenkilobot", "../assets/KILOGREEN.png");
        game.load.image("bluekilobot", "../assets/KILOBLUE.png");

        game.load.image("platformblack", "../assets/GroundTypeBlack.png");
        game.load.image("platformred", "../assets/GroundTypeRed.png");
        game.load.image("platformgreen", "../assets/GroundTypeGreen.png");
        game.load.image("platformblue", "../assets/GroundTypeBlue.png");

        game.load.image("yellowclock", "../assets/yellowclock.png");

        game.load.image("startButton", "../assets/StartButton.png");
        game.load.image("instructionsButton", "../assets/InstructionsButton.png");

        game.load.audio("jump", "../assets/punch.mp3");
        game.load.audio("beat", "../assets/beat.mp3");
    }
    
    // background variables
    var blackbackground;
    var redbackground;
    var greenbackground;
    var bluebackground;
    var mainmenu;
    var instruction;

    var startTime;

    // buttons
    var startButton;
    var instructionButton;
    
    // KiloBot Status
    var kilobots;
    var bot;
    var undiscovered;
    var coords = [];
    var flag = [];
    var num;
    var kilocolor = [0, 0, 0, 0];
    var hasMoved = false;
    var start = false;
    
    // user controls
    var controls;
    var jumpKilobot;
    var toggleDelay = 0;
    var toggleBlack;
    var toggleRed;
    var toggleGreen;
    var toggleBlue;

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
    var highScore = 0;
    var topScore = 0;

    // TimerObject Variables
    var incTime;
    var newTime;
    var timeCounter = 0;
    
    //LARGE LEVEL SIZE
    var levelWidth = 10000000;
    var levelHeight = height;
    
    function create() {
        // initialize physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // initialize 4 backgrounds, display black
        blackbackground = game.add.tileSprite(0, 0, levelWidth, levelHeight, "blackbackground");
        redbackground = game.add.tileSprite(0, 0, levelWidth, levelHeight, "redbackground");
        greenbackground = game.add.tileSprite(0, 0, levelWidth, levelHeight, "greenbackground");
        bluebackground = game.add.tileSprite(0, 0, levelWidth, levelHeight, "bluebackground");
        mainmenu = game.add.tileSprite(0, 0, 1200, 750, "mainmenu");
        instruction = game.add.tileSprite(0, 0, 1200, 750, "instruction");
        
        // set world boundaries to the global width, height
        game.world.setBounds(0, 0, levelWidth, levelHeight);
        
        // initialize kilobots sprite group and enable physics engine on the group
        kilobots = game.add.group();
        kilobots.enableBody = true;

        // initialize undiscovered sprite group and enable physics engine on the group
        undiscovered = game.add.group();
        undiscovered.enableBody = true;

        // initialize timer sprite group and enable physics engine on the group
        newTime = game.add.group();
        newTime.enableBody = true;

        // initialize platform groups and enable physics on all children of group
        platformsBlack = game.add.group();
        platformsBlue = game.add.group();
        platformsRed = game.add.group();
        platformsGreen = game.add.group();
        platformsBlack.enableBody = true;
        platformsRed.enableBody = true;
        platformsBlue.enableBody = true;
        platformsGreen.enableBody = true;
        
        // initialize controls
        controls = game.input.keyboard.createCursorKeys();
        jumpKilobot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        toggleBlack = game.input.keyboard.addKey(Phaser.Keyboard.F);
        toggleRed = game.input.keyboard.addKey(Phaser.Keyboard.D);
        toggleGreen = game.input.keyboard.addKey(Phaser.Keyboard.S);
        toggleBlue = game.input.keyboard.addKey(Phaser.Keyboard.A);

        // initialize time text at top left and fix to camera
        time = game.add.text(0, 0, "Time Left: " + timer + " seconds", {
            font: "30px Arial",
            fill: "#2C2F9C"
        });
        time.fixedToCamera = true;
        time.cameraOffset.setTo(20, 20);

        // initialize score text at top left and fix to camera
        score = game.add.text(0, 0, "Score: " + points, {
            font: "30px Arial",
            fill: "#2C2F9C"
        });
        score.fixedToCamera = true;
        score.cameraOffset.setTo(20, 60);

        //display high score
        highScore = game.add.text(0, 0, "High Score: " + highScore, {
            font: "30px Arial",
            fill: "#2C2F9C" 
        });
        highScore.fixedToCamera = true;
        highScore.cameraOffset.setTo(20, 100);

        // call respawn to initialize the rest of the game
        //respawn();
        menu();
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
                if(kilobots.getAt(i).body.touching.down) { // CHANGE CONDITION FOR STARTING/RESTARTING GAME
                    start = true;
                    startTime = game.time.totalElapsedSeconds();
                } else {
                    start = false;
                }
            }
        } else {
            if(!controls.left.isDown && !controls.right.isDown) {
                for(var i=0; i<kilobots.children.length; i++) {
                    kilobots.children[i].body.velocity.x = 0;
                }
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

            // swap kilobots
            if(toggleDelay < game.time.now) {
                toggleDelay = game.time.now + 150;
                if(toggleBlack.isDown && kilocolor[0] == 1) {
                    platformsBlack.alpha = 1;
                    platformsRed.alpha = 0;
                    platformsGreen.alpha = 0;
                    platformsBlue.alpha = 0;

                    blackbackground.alpha = 1;
                    redbackground.alpha = 0;
                    greenbackground.alpha = 0;
                    bluebackground.alpha = 0;
                } else if(toggleRed.isDown && kilocolor[1] == 1) {
                    platformsBlack.alpha = 0;
                    platformsRed.alpha = 1;
                    platformsGreen.alpha = 0;
                    platformsBlue.alpha = 0;

                    blackbackground.alpha = 0;
                    redbackground.alpha = 1;
                    greenbackground.alpha = 0;
                    bluebackground.alpha = 0;
                } else if(toggleGreen.isDown && kilocolor[2] == 1) {
                    platformsBlack.alpha = 0;
                    platformsRed.alpha = 0;
                    platformsGreen.alpha = 1;
                    platformsBlue.alpha = 0;

                    blackbackground.alpha = 0;
                    redbackground.alpha = 0;
                    greenbackground.alpha = 1;
                    bluebackground.alpha = 0;
                } else if(toggleBlue.isDown && kilocolor[3] == 1) {
                    platformsBlack.alpha = 0;
                    platformsRed.alpha = 0;
                    platformsGreen.alpha = 0;
                    platformsBlue.alpha = 1;

                    blackbackground.alpha = 0;
                    redbackground.alpha = 0;
                    greenbackground.alpha = 0;
                    bluebackground.alpha = 1;
                }
            }

            // Move kilobot head
            if (controls.left.isDown) {
                // move left
                kilobots.children[0].body.velocity.x += -50;
                hasMoved = true;
            } else if (controls.right.isDown) {
                // move right
                kilobots.children[0].body.velocity.x += 50;
                hasMoved = true;
            }
            
            // kilobot jump code
            if ((controls.up.isDown || jumpKilobot.isDown) && (kilobots.getAt(0).body.onFloor() || kilobots.getAt(0).body.touching.down)) {
                // jump
                kilobots.children[0].body.velocity.y = -550;
                game.music = game.add.audio('jump');
                game.music.play();
                hasMoved = true;
            }

            // push coordinates into coords 2d array for movement
            if(hasMoved) {
                coords[0].push({x:Math.floor(kilobots.children[0].body.x), y:Math.floor(kilobots.children[0].body.y)});
            }

            // decrease time
            // need to fix this check statement to something better
            if(((game.time.totalElapsedSeconds()-startTime)-timeCounter) > (61-timer)) {
                updateTime();
            }

            // update score
            updateScore(kilobots.children[0].body.x);

            // game over state
            if(kilobots.getAt(0).body.onFloor() || timer == 0) {
                kilobots.removeAll(true);
                undiscovered.removeAll(true);
                newTime.removeAll(true);
                //retry();
                platformsBlack.removeAll(true);
                platformsRed.removeAll(true);
                platformsBlue.removeAll(true);
                platformsGreen.removeAll(true);
                respawn();
                //gameOver();
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
        bot.body.maxVelocity.x = 450;
        //bot.anchor.setTo(0.5, 0.5);
        flag.push(false);
        coords.push([]);
        game.camera.follow(kilobots.getAt(0));

        num = 0;
        kilocolor = [0, 0, 0, 0];
        kilocolor[num] = 1;
        num++;

        //remove buttons
        startButton.visible = false;
        instructionButton.visible = false;
        mainmenu.alpha = 0;
        instruction.alpha = 0;
        blackbackground.alpha = 1;
        time.alpha = 1;
        score.alpha = 1;
        highScore.alpha = 1;

        // reset time
        timer = 61;
        updateTime();
        game.time.reset();
        timeCounter = 0;

        // reset points
        points = 0;
        maxDistance = 0;

        // make all platforms except black invisible
        platformsRed.alpha = 0;
        platformsGreen.alpha = 0;
        platformsBlue.alpha = 0;
        platformsBlack.alpha = 1;
        generatePlatforms();

        // make all backgrounds except black invisible
        blackbackground.alpha = 1;
        redbackground.alpha = 0;
        greenbackground.alpha = 0;
        bluebackground.alpha = 0;

        game.music = game.add.audio('beat');
        game.music.play();


    }

    function generateKilobot(color, x, y) {
        // generate unfound kilobots
        bot = undiscovered.create(x, y, color);
        bot.body.collideWorldBounds = true;
        bot.body.gravity.y = 1000;
        bot.body.setSize(56, 42, 0, 0);
    }

    function generateIncTime(x, y){
        incTime = newTime.create(x, y, 'yellowclock');
        incTime.body.collideWorldBounds = true;
        incTime.body.gravity.y = 1000;
        incTime.body.setSize(50, 50, 0, 0);
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

            if(i == 4 || i == 14 || i == 34) {
                prevWidth = 200;
            }

            platform.scale.setTo(prevWidth/600, prevHeight/182);
            platform.body.immovable = true;

            // Generate kilobot at platform i
            if(i == 4) {
                generateKilobot('redkilobot', nextX+100, nextY-50);
            }

            if(i == 14) {
                generateKilobot('greenkilobot', nextX+100, nextY-50);
            }

            if(i == 34) {
                generateKilobot('bluekilobot', nextX+100, nextY-50);
            }

            // Generate time at platform i
            if((i % 10) == 0 && i != 0){
                generateIncTime(nextX, nextY-150);
            }


        }
    }

    function pickUp(player, bot) {
        hasMoved = false;
        kilobots.add(undiscovered.getAt(0));
        kilocolor.push(undiscovered.getAt(0).key);
        undiscovered.remove(bot, true);
        kilocolor[num] = 1;
        coords[num-1] = [];
        coords.push([]);
        num++;
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
            if(points > topScore){
                topScore = points;
                highScore.setText("High Score: " + (Math.floor(topScore)-50));
            }
        }
    }

    function menu(){
        blackbackground.alpha = 0;
        redbackground.alpha = 0;
        greenbackground.alpha = 0;
        bluebackground.alpha = 0;
        time.alpha = 0;
        score.alpha = 0;
        highScore.alpha = 0;
        instruction.alpha = 0;
        startButton = game.add.button(435, 350, 'startButton', respawn, this);
        instructionButton = game.add.button(295, 500, 'instructionsButton', instructions, this);
    }

    function instructions(){
        game.world.remove(startButton);
        game.world.remove(instructionButton);
        instruction.alpha = 1;
        mainmenu.alpha = 0;
        // new x, y for play
        startButton = game.add.button(515, 680, 'startButton', respawn, this);
        startButton.scale.setTo(0.5, 0.5);
    }

    function gameOver() {
        blackbackground.alpha = 0;
        redbackground.alpha = 0;
        greenbackground.alpha = 0;
        bluebackground.alpha = 0;

        retryButton = game.add.button(game.world.centerX - 100, game.world.centerY, 'retryButton', respawn, this);
        menuButton = game.add.button(game.world.centerX + 100, game.world.centerY, 'menuButton', menu, this);
    }

    function retry() {
        retryButton = game.add.button(game.world.centerX, game.world.centerY, 'retryButton', respawn, this);
    }
});